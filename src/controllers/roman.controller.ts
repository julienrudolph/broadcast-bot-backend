import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as ChannelToUserRepo from '../repositories/channelToUser.repo';
import * as Messagerepo from '../repositories/message.repo';
import * as Broadcastrepo from '../repositories/broadcast.repo';
import * as Whitelistrepo from '../repositories/whitelist.repo';

import * as Utils from '../utils/wirebackend.utils';
import * as Logger from '../utils/logging.utils';
import { BotUser, Channel, ChannelToUser, BroadCast, Whitelist } from '../models';

import { IScimUserResponse, IBroadCast, IMessage } from '../interfaces/interfaces';

let admins = process.env.ADMINS;
let appKey = process.env.APPKEY;
let bearer = "Bearer " + process.env.BEARER;
let romanBase = process.env.ROMAN_BASE;

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    romanBase = romanBase.endsWith('/') ? romanBase : `${romanBase}/`;
    const { type, userId, messageId, conversationId } = body;
    if(header.authorization === bearer){
      if(admins.includes(userId)){
        return await this.determmineHandler(true, body , appKey);
      }else{
        return await this.determmineHandler(false, body, appKey);
      }        
    }
  }

  private async determmineHandler(isAdmin, body, appKey){
    const { type } = body;
    if(type === "conversation.init"){
      return this.handleInit(isAdmin);
    }
    if(type === "conversation.new_text"){
      return this.handleText(isAdmin, body, appKey);
    }
    if(type === "conversation.bot_request"){
      return this.handleBotRequest(isAdmin, body);
    }
    if(type === "conversation.asset.preview"){
      return this.handleAssetPreview();
    }
    if(type === "conversation.asset.data"){
      return await this.handleAssetData(isAdmin, body, appKey);
    }
    if(type === "conversation.file.preview"){
      // console.log(body);
      // do i need to do something? 
    }
    if(type === "conversation.reaction"){
      this.handleReaction();
    }
  }

  private async handleBotRequest(isAdmin: boolean, body){
    Logger.logInfo("handleBotRequest");
    let userInfo:IScimUserResponse = await Utils.getUserRichInfosById(body.userId);
    let user:BotUser = {
      displayName: userInfo.displayName,
      email: userInfo.externalId,
      userId: userInfo.id,
      createdAt: (new Date),
      updatedAt: (new Date)
    }

    // check if user is allowed to request bot 
    if(process.env.ENABLE_WHITELIST){
      let whitelist:Whitelist[] = await Whitelistrepo.getWhitelist();
      if(!whitelist.find(item => {return item.mail === user.email})){
        return "user_not_allowed";
      }
    }
    let channel = await Channelrepo.getChannelByBotId(body.botId);
    if(!channel){
      let newChannel:Channel = {
        botId: body.botId,
        name: "Dev-Channel",
      }
      await Channelrepo.createChannel(newChannel).then(async () => {
        channel = await Channelrepo.getChannelByBotId(body.botId);
      });
    }
    let existUser = await Userrepo.getUserByWireId(body.userId);
    if(!existUser){
      existUser = await Userrepo.createUser(user);
    }
    let channelToUser:ChannelToUser = {
      userId: existUser.id,
      channelId: channel.id,
      conversationId: body.conversationId,
      isAdmin: isAdmin,
      isApproved: true,
      isMuted: false,
      user: existUser,
      channel: channel,
      userToken: body.token
    }
    let channelAdd = await ChannelToUserRepo.createChannelToUser(channelToUser);
  }

  private async handleAssetData(isAdmin: boolean, body, appKey: string){
    Logger.logInfo("handleAssetData");
    if(isAdmin){
      return this.broadCastAsset(appKey, body, body.userId);
    }else{
      return ({type: 'text', text: {data: "Im Broadcast sind keine Antworten möglich. Bei Fragen finden Sie hier https://www.cducsu.btg weitere Informationen."}}) 
    }
  }

  // toDo implement admin receives message from channel member
  private async handleText(isAdmin: boolean, body: any, appKey: string){
    Logger.logInfo("handleText");
    const {text, userId , messageId} = body;
    const messageText:string = text?.data ?? '';
    if(isAdmin){
      if(messageText.match(/^\/list\s\d+$/)){
        let count = messageText.split(" ")[1];
        if(count){
          return await this.getBroadcasts(count as unknown as number);
        }
        return this.getBroadcasts(0);
      }else if(messageText.startsWith("/stats")){
        let broadCastId = messageText.split(" ")[1];
        let message = "";
        await this.getBroadcastStat(appKey, broadCastId).then((value: IBroadCast) => {   
          value.report.forEach(elem => {
            message = message + elem.type + " - " + elem.count.toString() + "\n";
          });
        });
        return ({
          type: 'text',
          text: {
            data: message
          }
        });

      }
      else if(messageText.startsWith("/list")){
        return await this.getBroadcasts(0);
      }
      else if(messageText.startsWith("/help")){
        return ({type: 'text', text: {data :  "**/help** - zeigt die Liste der Kommandos an\n " +
                                              "**/broadcast** <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
                                              "**/info** - zeigt Informationen über den Kanal\n" + 
                                              "**/list** - zeigt Informationen der letzten 20 Broadcasts an\n" +
                                              "**/list** <Anzahl> - zeigt Informationen für die letzten <Anzahl> Broadcasts an\n" +
                                              "**/members** - zeigt alle Abonnenten des Kanals an\n" + 
                                              "**/stats** <ID> - zeigt die Statistiken des Broadcast mit der <ID> an\n" +
                                              "**/stats** - zeigt die Statistik der letzten Broadcastnachricht\n\n" +
                                              "Detailliertere Informationen finden Sie auf der [Lernplattform](https://gruppen.cducsu.de/sites/Lernplattform)."
                                      }
                });        
      }
      else if(messageText.startsWith("/info")){
        return ({type: 'text', text: {data: "Sie befinden sich im Kanal: " + process.env.CHANNEL_NAME + ". Sie sind Broadcaster."}});
      }
      else if(messageText.startsWith("/members")){
        let message:String = "";
        await this.getChannelMember().then((response:BotUser[]) => {
          message = message + "Anzahl: " + response.length.toString() + "\n\n";
          response.forEach(elem => {
            message = message + "Name: " + elem.displayName + " - EMail: " + elem.email + "\n";
          });  
        });
        return ({
          type: 'text', 
          text: {
            data: message
          }
        });
        // return ({type: 'text', text: {data: "Es konnten Benutzer gefunden werden."}});
      }
      else if(messageText.startsWith("/broadcast")){
        const broadCast = messageText.substring(10);
        return this.broadCastMessage(broadCast, appKey, userId, messageId);
      }
      else{
        return ({type: 'text', text: {data: "Haben Sie ein Kommando vergessen? Nutzen Sie **/help** um diese anzeigen. Diese Nachricht wurde nicht verarbeitet und wird nur Ihnen angezeigt."}});
      }
    }else{
      if(messageText.startsWith("/help")){
        return ({type: 'text', text: {data : "Ihnen stehen folgende Kommandos zur Verfügung.\n\n" +
                                        "**/help** - zeigt die Liste der Kommandos\n " +
                                        "**/info** - zeigt Informationen über den Kanal\n"   
                                      }
                });        
      }
      else if(messageText.startsWith("/info")){
        return ({type: 'text', text: {data: "Sie befinden sich im Kanal: " + process.env.CHANNEL_NAME + "\n Weitere Informationen erhalten Sie unter [hier](https://www.cducsu.de)." }});
      }
      else if(messageText.startsWith("/")){
        return ({
          type: 'text',
          text: {
            data: 'Dies ist kein valides Kommando. Nutzen Sie /help um alle Kommandos anzuzeigen.'
          }
        })
      
      }else{
        if(process.env.ENABLE_USER_RESPONSE){
          return ({type: 'text', text: {data: "Antworten sind in diesem Kanal nicht möglich. Ihre Nachricht wird nicht verarbeitet und nur Ihnen angezeigt."}});
        }else{
          this.handleUserMessage(body);
          return ({type: 'text', text: {data: "Die Nachricht wurde an die Broadcaster des Kanals übermittelt."}});
        }  
      }
    } 
  }

  private async getBroadcasts(count: number){
    const broadCast:BroadCast[] = await Broadcastrepo.getBroadcastsCount(count);
    let message: string = "Folgende Broadcastnachrichten wurden in diesem Kanal versendet: \n\n"
    if(broadCast){
      for (const elem of broadCast){
        let user = await Userrepo.getUserByWireId(elem.userId);
        if(elem){
          message = message + " BroadCast ID " + elem.id +  " vom " + elem.createdAt.toLocaleTimeString("de",{day:'numeric', month:'numeric',year:'numeric', hour:'numeric',minute:'numeric'}) + " versand von **" + user.displayName +  "**\n"
        }
      }
      return ({
        type: 'text',
        text: {
          data: message
        }
      }); 
    }else{
      return ({
        type: 'text',
        text: {
          data: "Es wurden keine Nachrichten gefunden."
        }
      });
    }
  }

  private async handleAssetPreview(){

  };

  private async handleInit(isAdmin: boolean): Promise<IMessage> {
    Logger.logInfo("handleInit");
    const helpMessageUser = "Sie haben den " + process.env.CHANNEL_NAME + " abonniert.\n\n" +
      "Ihnen stehen folgende Kommandos zur Verfügung.\n\n" +
      "**/help** - zeigt die Liste der Kommandos\n " +
      "**/info** - zeigt Informationen über den Kanal\n\n" +
      "Detailliertere Informationen finden Sie auf der [Lernplattform](https://gruppen.cducsu.de/sites/Lernplattform).";
    const helpMessageAdmin = "Sie haben den " + process.env.CHANNEL_NAME + " abonniert. Sie sind Broadcaster.\n\n" +
      "Ihnen stehen folgende Kommandos zur Verfügung.\n\n" +
      "**/help** - zeigt die Liste der Kommandos an\n " +
      "**/broadcast** <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
      "**/info** - zeigt Informationen über den Kanal\n" + 
      "**/list** - zeigt Informationen der letzten 20 Broadcasts an\n" +
      "**/list** <Anzahl> - zeigt Informationen für die letzten <Anzahl> Ihrer Broadcasts an\n" +
      "**/members** - zeigt alle Abonnenten des Kanals an\n" + 
      "**/stats** <ID> - zeigt die Statistiken des Broadcast mit der <ID> an\n" +
      "**/stats** - zeigt die Statistik der letzten Broadcastnachricht\n\n" +
      "Detailliertere Informationen finden Sie auf der [Lernplattform](https://gruppen.cducsu.de/sites/Lernplattform).";
    if(isAdmin){
      return ({type: 'text', text: {data: helpMessageAdmin}});  
    }else{
      return ({type: 'text', text: {data: helpMessageUser}});  
    }
  }

  private async handleUserMessage(body){
    Logger.logInfo("handleUserMessage");
    const romanMessageUri = romanBase + "api/conversation";
    let sender = await Userrepo.getUserByWireId(body.userId);
    let channelAdmins: string[] = admins.split(',');
    channelAdmins.forEach(async element => {
      let userInfo = await Userrepo.getUserByWireId(element);
      let channelUserInfo = await ChannelToUserRepo.getChannelToUserByUserId(userInfo.id);
      try{
        let auth:string = "Bearer " + channelUserInfo.userToken; 
        let message = {
          "type" : "text",
          "conversationId": channelUserInfo.conversationId,
          "text" : {
            "data": sender.displayName + " schrieb: " + body.text.data
          }
        }
        fetch(
          romanMessageUri, {
            method: "POST",
            headers: {'Authorization': auth, 'Accept': 'application/json', 'Content-Type':'application/json'},
            body: JSON.stringify(message) 
          }
        )
      }catch(e){
        console.log(e)
      }  
    });
  }

  private async broadCastMessage(message: string, appKey: string, userId: string, messageId: string){
    Logger.logInfo("broadCastMessage");
    try {
      let broadCastMessage:IMessage = ({type: 'text', text: {data: message}});
      let result = await this.broadCastToWire(broadCastMessage, appKey).then(async (value:string) => {
        let newBroadcast:BroadCast = {
            broadCastId: value.split('"')[3],
            message: message,
            userId: userId
          }
          try{
            let broadcastEntry = await Broadcastrepo.createBroadcast(newBroadcast);
            // Logger.logInfo(JSON.stringify(broadcastEntry));
            return ({
              type: 'text',
              text: {
                data: "Broadcast mit der ID " + broadcastEntry.id + " versendet."
              }
            }); 
          }catch(e){
  
          }
      });
      return result;
    }catch(e){
      console.log(e);
    }
  }

  private async broadCastAsset(appKey: string, body, userId:string ){
    Logger.logInfo("broadCastAsset");
    try {
      let input = body;
        let broadCastMessage = ({
          "type": "attachment",
          "attachment": {
            "mimeType": body.attachment.mimeType,
            "height": input.attachment.height,
            "width": input.attachment.width,
            "size": input.attachment.size,
            "name": input.attachment.name,
            "meta": {
              "assetId": body.attachment.meta.assetId,
              "sha256": body.attachment.meta.sha256,
              "otrKey": body.attachment.meta.otrKey,
              "domain": "wire.com"  
            }
          }
        });
      let result = await this.broadCastToWire(broadCastMessage, appKey).then(async (value:string) => {
        try{
          let broadcastEntry = await Broadcastrepo.createBroadcast({
            broadCastId: value.split('"')[3],
            message: body.attachment.name,
            userId: userId
          });
          // Logger.logInfo(JSON.stringify(broadcastEntry));
          return ({
            type: 'text',
            text: {
              data: "Broadcast mit der ID " + broadcastEntry.id + " versendet."
            }
          }); 
        }catch(e){

        }
      });
      return result;
    }catch(e){
      console.log(e);
    }
  }

  private async broadCastToWire(message, appKey: string):Promise<string>{
    Logger.logInfo("broadCastToWire");
    const romanBroadcastUri = romanBase + "api/broadcast";
    let id = "";
    await fetch(
      romanBroadcastUri,
      {
        method: 'POST',
        headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(message)
      }    
    ).then(async (response:Response)  => {
      await response.text().then(value => {
        try {
           id = value;
        }catch(ignored){
  
        }
      });
    });
    return id;
  }

  private async getBroadcastStat(appKey:string, broadCastId?: string){
    Logger.logInfo("getBroadcastStats");
    let stats:IBroadCast;
    if(broadCastId){
      let broadCast = await Broadcastrepo.getBroadcastById(broadCastId as unknown as number);
      let romanUri = romanBase + `api/broadcast?id=${broadCast.broadCastId}`;
        await fetch(
          romanUri,
          {
            method: 'GET',
            headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
          }    
        ).then(async (response:Response)  => {
          await response.text().then(value => {
            try {
               stats = JSON.parse(value);
            }catch(ignored){
            }
          });
        });
    }else{
      let lastBroadcast:BroadCast = await Broadcastrepo.getLastBroadcast();
      if(lastBroadcast){
        let romanUri = romanBase + `api/broadcast?id=${lastBroadcast.broadCastId}`;
        await fetch(
          romanUri,
          {
            method: 'GET',
            headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
          }    
        ).then(async (response:Response)  => {
          await response.text().then(value => {
            try {
               stats = JSON.parse(value);
            }catch(ignored){
      
            }
          });
        });
      }
    }
    return stats;
  }

  private async getChannelMember(){
    try{
      let users:BotUser[] = await Userrepo.getUsers();
      return users;
    }catch(e){
      return [];
    }
  }

  private async handleReaction(){
    /*
      {"message":{"botId":"f917fa7d-39e3-4c3c-9960-5ed4115160dd",
      "type":"conversation.reaction",
      "userId":"9e54ce88-506e-43d7-b95b-af117d51000d",
      "token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZjkxN2ZhN2QtMzllMy00YzNjLTk5NjAtNWVkNDExNTE2MGRkIiwiZXhwIjoxNzA5NTQxNTgwfQ.l6b5xJgBDquD6AUsN1ubekx5hLyJjo45JghbiYb80WU",
      "messageId":"d82cc5a4-4856-4c6f-ac6b-0552344d665a",
      "refMessageId":"12f993f4-a25e-41e1-908d-0b85a4fba70e",
      "conversationId":"4eebcbf0-8334-4863-a2a4-35c7c60ef2a8","emoji":"👍"},"level":"INFO","type":"LOG"}
    */

    // should something happen if user reacts to message in channel --> maybe something like polls 
    /*
      save user input to tables --> user should react with thumps up or down 
      --> /reaction command could be uses to display last poll /reaction <ID> could be used to show 
      reactions to specific message 
    */ 
  }

}