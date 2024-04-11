import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as ChannelToUserRepo from '../repositories/channelToUser.repo';
import * as Messagerepo from '../repositories/message.repo';
import * as Broadcastrepo from '../repositories/broadcast.repo';

import * as Utils from '../utils/wirebackend.utils';
import * as Logger from '../utils/logging.utils';
import { BotUser, Channel, ChannelToUser, BroadCast } from '../models';

import { IScimUserResponse, IBroadCast, IMessage } from '../interfaces/interfaces';

import {readFile} from 'fs/promises';


// ToDo dev options use .env if we switching to production 

// ToDo convert strings to string.js file ... maybe different languages

// let admins = "9e54ce88-506e-43d7-b95b-af117d51000d";
let admins = "55150f06-c2a4-4c29-b99d-b08afe608172,9e54ce88-506e-43d7-b95b-af117d51000d";

/*
Wire roman proxy config 

let appKey = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZDBjZmY5YzctMGIwOS00NjM4LWFiYjUtODFlZDA0ODc1NmIwIn0.qWevLrDlJA_tf46Vw5FC7wzwP93RmqlHRNY62sCRGV8";
let bearer = "Bearer km7a5l5VEIAXD-N_61_Xo-wh";
let romanBase = 'https://proxy.services.wire.com/';
*/


// self hosted roman  
let appKey = 'eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiYzFlYzA3OTgtMjZlYS00YzMzLTgyMjktYzUxYmVjMWE5ZThkIn0.b8YO7VF8nNEOjQIh46XMgBO3lRyy6_qwYZgbE8nkJ5sShICaMCJhJdGv-R1_UzIVKJz6l31cqFrfIHZuZOjyRQ';
let bearer = 'Bearer XpFk1XxxbiNsYTOdAYJkrHLR';
let romanBase = 'https://roman.myservicetest.de/';
let whiteListPath = '/app/config.json';

// let admins = process.env.ADMINS;
// let appKey = process.env.APPKEY;
// let bearer = "Bearer " + process.env.BEARER;


@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    Logger.logInfo(body);
    // console.log(header);
    console.log("Body");
    console.log(body);
    // let whiteList = this.loadWhitelistFromFile();
    // console.log(process.env);
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

  private async loadWhitelistFromFile(){
    const fileContent = await readFile('.env', 'utf-8');
    if(fileContent){
      return JSON.parse(fileContent);
    }
    return null;
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
      return this.handleAssetData(isAdmin, body, appKey);
    }
    if(type === "conversation.file.preview"){
      console.log(body);
      // do i need to do something? 
    }
  }

  private async handleBotRequest(isAdmin: boolean, body){
/*
    toDo:
    - implement positiv filter 
      - take a list of email adresses
      - take user by id from backend 
      - lookup mail adress in allowed list
      - if mail is found return 200 else return not permitted and return 409 in router
*/ 

    Logger.logInfo("handleBotRequest");
    let userInfo:IScimUserResponse = await Utils.getUserRichInfosById(body.userId);
    let user:BotUser = {
      displayName: userInfo.displayName,
      email: userInfo.externalId,
      userId: userInfo.id,
      createdAt: (new Date),
      updatedAt: (new Date)
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
      return this.broadCastAsset(appKey,body);
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
        if(messageText.startsWith("/show")){
          return this.getAllBroadcastsByUserId(userId);
        }
        else if(messageText.startsWith("/help")){
          return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos an\n " +
                                                "/broadcast <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
                                                "/last - zeigt die Statistik des letzten Broadcast an \n" +
                                                "/stats <ID> - erzeugt eine Broadcast Nachricht\n" +
                                                "/info - zeigt Informationen über den Kanal\n" + 
                                                "/show - zeigt alle Broadcast des aktuellen Benutzers an\n" +
                                                "/members - zeigt alle Abonnenten des Kanals an"   
                                        }
                  });        
        }
        else if(messageText.startsWith("/info")){
          return ({type: 'text', text: {data: "Dev-Channel der Fraktion. Sie sind Administrator"}});
        }
        else if(messageText.startsWith("/stats")){
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
        }else if(messageText.startsWith("/members")){
          let message:String = "";
          await this.getChannelMember().then((response:BotUser[]) => {
            message = message + "Anzahl: " + response.length.toString() + "\n\n";
            response.forEach(elem => {
              message = message + "Name: " + elem.displayName + " - EMail: " + elem.email + "\n";
            });  
            console.log(message);
          });
          return ({
            type: 'text', 
            text: {
              data: message
            }
          });
          // return ({type: 'text', text: {data: "Es konnten Benutzer gefunden werden."}});
        }
        else if(messageText.startsWith("/last")){
          let message = ""
          await this.getBroadcastStat(appKey).then((value: IBroadCast) => {   
            if(value){
              value.report.forEach(elem => {
                message = message + elem.type + " - " + elem.count.toString() + "\n"; 
              });
            }else{
              message = "Keine Broadcastnachrichten vorhanden."
            }
          });
          return ({
            type: 'text',
            text: {
              data: message
            }
          });
        }
        else if(messageText.startsWith("/broadcast")){
          const broadCast = messageText.substring(10);
          return this.broadCastMessage(broadCast, appKey, userId, messageId);
        }
        else{
          return ({type: 'text', text: {data: "Haben Sie ein Kommando vergessen? Diese Nachricht wurde nicht versand und wird nicht protokolliert."}});
        }
    }else{
      if(messageText.startsWith("/help")){
        return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos\n " +
                                             "/info - zeigt Informationen über den Kanal\n"   
                                      }
                });        
      }
      else if(messageText.startsWith("/info")){
        return ({type: 'text', text: {data: "Dev-Channel der Fraktion."}});
      }
      else if(messageText.startsWith("/")){
        return ({
          type: 'text',
          text: {
            data: 'Leider stehen Ihnen keine weiteren Kommandos zur Verfügung.'
          }
        })
      
      }else{
        this.handleUserMessage(body);
        // return ({type: 'text', text: {data: "Diese Nachricht wird nicht weitergeleitet und nicht protokolliert."}})
      }
    } 
  }

  private async getAllBroadcastsByUserId(userId: string){
    const broadCast:BroadCast[] = await Broadcastrepo.getBroadcastsByUserId(userId);
    let message: string = "Folgende Broadcastnachrichten wurden zu Ihrem Benutzer gefunden: \n\n"
    if(broadCast){
      broadCast.forEach(elem => {
        if(elem){
          message = message + " BroadCast ID: " + elem.broadCastId + '\n'
        }
      });
      return ({
        type: 'text',
        text: {
          data: message
        }
      }) 
    }
  }

  private async handleAssetPreview(){

  };

  private async handleInit(isAdmin: boolean): Promise<IMessage> {
    Logger.logInfo("handleInit");
    const helpMessageUser = "Sie haben den Dev-Channel der Fraktion abonniert.\n\n" +
                            "/help - zeigt die Liste der Kommandos\n " +
                            "/info - zeigt Informationen über den Kanal\n" ;
    const helpMessageAdmin = "Sie haben den Dev-Channel der Fraktion abonniert. Sie sind Broadcaster.\n\n" +
                             "/help - zeigt die Liste der Kommandos\n " +
                             "/broadcast <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
                             "/last - zeigt die Statistik des letzten Broadcast an \n" +
                             "/stats <ID> - erzeugt eine Broadcast Nachricht\n" +
                             "/info - zeigt Informationen über den Kanal\n" +
                             "/member - zeigt alle Abonnenten des Kanals an\n";
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
      await this.broadCastToWire(broadCastMessage, appKey).then((value:string) => {
        let newBroadcast:BroadCast = {
            broadCastId: value.split('"')[3],
            message: message,
            userId: userId
          }
          try{
            let broadcastEntry = Broadcastrepo.createBroadcast(newBroadcast);
            Logger.logInfo(JSON.stringify(broadcastEntry));
          }catch(e){
  
          }
      });
    }catch(e){
      console.log(e);
    }
  }

  private async broadCastAsset(appKey: string, body){
    console.log(body);
    Logger.logInfo("broadCastAsset");
    try {
      let input = body;
        let broadCastMessage = ({
          "type": "attachment",
          "attachment": {
            "mimeType": "image/jpg",
            "height": input.attachment.height,
            "width": input.attachment.width,
            "size": input.attachment.size,
            "name": input.attachment.name,
            "meta": {
              "assetId": body.attachment.meta.assetId,
              "sha256": body.attachment.meta.sha256,
              "otrKey": body.attachment.meta.otrKey  
            }
          }
        });
        let message = {
          type: "attachment",
          attachment: body.attachment
        }
      await this.broadCastToWire(broadCastMessage, appKey).then(res => {
    });
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
      let romanUri = romanBase + `api/broadcast?id=${broadCastId}`;
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