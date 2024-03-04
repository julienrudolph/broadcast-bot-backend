import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as ChannelToUserRepo from '../repositories/channelToUser.repo';
import * as Messagerepo from '../repositories/message.repo';
import * as Broadcastrepo from '../repositories/broadcast.repo';

import * as Utils from '../utils/wirebackend.utils';
import * as Logger from '../utils/logging.utils';
import { BotUser, Channel, ChannelToUser, BroadCast } from '../models';

import { IConversationInit, IScimUserResponse, IAttachmentMessage, IBroadCast } from '../interfaces/interfaces';
import connectDB from "../config/database";
 
interface HandlerDto {
  body: any
  isUserAdmin: boolean
  appKey: string
}

interface IData{
  data: string;
}

interface IMessage{
  type: string;
  text: IData;
}

let romanBase = 'https://proxy.services.wire.com/';

// let admins = "9e54ce88-506e-43d7-b95b-af117d51000d";
let admins = "55150f06-c2a4-4c29-b99d-b08afe608172,9e54ce88-506e-43d7-b95b-af117d51000d";
let appKey = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZDBjZmY5YzctMGIwOS00NjM4LWFiYjUtODFlZDA0ODc1NmIwIn0.qWevLrDlJA_tf46Vw5FC7wzwP93RmqlHRNY62sCRGV8";
let bearer = "Bearer km7a5l5VEIAXD-N_61_Xo-wh";
let filePath = "./tmp"

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    Logger.logInfo(body);
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
    // ToDo find better switch case

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
        if(messageText.startsWith("/help")){
          return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos an\n " +
                                                "/broadcast <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
                                                "/last - zeigt die Statistik des letzten Broadcast an \n" +
                                                "/stats <ID> - erzeugt eine Broadcast Nachricht\n" +
                                                "/info - zeigt Informationen über den Kanal\n"   
                                        }
                  });        
        }
        else if(messageText.startsWith("/info")){
          return ({type: 'text', text: {data: "Dev-Channel der Fraktion. Sie sind Administrator"}})
        }
        else if(messageText.startsWith("/stats")){
          let broadCastId = messageText.split(" ")[1];
          let message = "";
          await this.getBroadcastStat(appKey, broadCastId).then((value: IBroadCast) => {   
            value.report.forEach(elem => {
              message = message + elem.type + " - " + elem.count.toString() + "\n" 
            });
          });
          return ({
            type: 'text',
            text: {
              data: message
            }
          })
        }
        else if(messageText.startsWith("/last")){
          let message = ""
          await this.getBroadcastStat(appKey).then((value: IBroadCast) => {   
            value.report.forEach(elem => {
              message = message + elem.type + " - " + elem.count.toString() + "\n" 
            });
          });
          return ({
            type: 'text',
            text: {
              data: message
            }
          })
        }
        else if(messageText.startsWith("/broadcast")){
          const broadCast = messageText.substring(10);
          return this.broadCastMessage(broadCast, appKey, userId, messageId);
        }
        else{
          return ({type: 'text', text: {data: "Haben Sie eine Kommando vergessen? Diese Nachricht wurde nicht versand und wird nicht protokolliert."}})
        }
    }else{
      if(messageText.startsWith("/help")){
        return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos\n " +
                                              "/info - zeigt Informationen über den Kanal\n"   
                                      }
                });        
      }
      else if(messageText.startsWith("/info")){
        return ({type: 'text', text: {data: "Dev-Channel der Fraktion."}})
      }
      else{
        this.handleUserMessage(body);
        
        // return ({type: 'text', text: {data: "Diese Nachricht wird nicht weitergeleitet und nicht protokolliert."}})
      }
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
                             "/info - zeigt Informationen über den Kanal\n" ;
    if(isAdmin){
      return ({type: 'text', text: {data: helpMessageAdmin}})  
    }else{
      return ({type: 'text', text: {data: helpMessageUser}})  
    }
  }

  private async handleUserMessage(body){
    Logger.logInfo("handleUserMessage");
    const romanMessageUri = romanBase + "api/conversation";
    let channelAdmins: string[] = admins.split(',');
    channelAdmins.forEach(async element => {
      let userInfo = await Userrepo.getUserByWireId(element);
      console.log(userInfo)
      let channelUserInfo = await ChannelToUserRepo.getChannelToUserByUserId(userInfo.id);
      try{
        let auth:string = "Bearer " + channelUserInfo.userToken; 
        let message = {
          "type" : "text",
          "conversationId": channelUserInfo.conversationId,
          "text" : {
            "data": body.text.data
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
    Logger.logInfo("broadCastMessage")
    try {
      let broadCastMessage:IMessage = ({type: 'text', text: {data: message}})
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
    Logger.logInfo("broadCastAsset");
    try {
      let input:IAttachmentMessage = body;
        let broadCastMessage = ({
          "type": "attachment",
          "attachment": {
            "mimeType": "image/jpeg",
            "height": input.attachment.height,
            "width": input.attachment.width,
            "size": input.attachment.size,
            "meta": {
              "assetId": input.attachment.meta.assetId,
              "sha256": body.attachment.meta.sha256,
              "otrKey": body.attachment.meta.otrKey  
            }
          }
        });
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
    const res = await fetch(
      romanBroadcastUri,
      {
        method: 'POST',
        headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(message)
      }    
    ).then(async (response:Response)  => {
      await response.text().then(value => {
        try {
           id = value
        }catch(ignored){
  
        }
      });
    });
    return id;
  }
  /* const getBroadcastStats = async (appKey: string, broadcastId: string | undefined = undefined) => {
    logDebug(`Retrieving broadcast stats for broadcast ${broadcastId}.`, { broadcastId });
    const url = broadcastId ? `${romanBroadcast}?id=${broadcastId}` : romanBroadcast;
    const request = await fetch(url, { method: 'GET', headers: { 'app-key': appKey } }).then(receiveJsonOrLogError);
    return convertStats(request);
  };
  
  const convertStats = ({ report }: { report: { type: string, count: number }[] }) =>
    report
    .map(({ type, count }) => `${type}: ${count}`)
    .join('\n');
  */
  private async getBroadcastStat(appKey:string, broadCastId?: string){
    Logger.logInfo("getBroadcastStats")
    let stats:IBroadCast;
    if(broadCastId){
      let romanUri = romanBase + `api/broadcast?id=${broadCastId}`;
        const res = await fetch(
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
        const res = await fetch(
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

  /*
  {"message":{"botId":"f917fa7d-39e3-4c3c-9960-5ed4115160dd",
   "type":"conversation.reaction",
   "userId":"9e54ce88-506e-43d7-b95b-af117d51000d",
   "token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZjkxN2ZhN2QtMzllMy00YzNjLTk5NjAtNWVkNDExNTE2MGRkIiwiZXhwIjoxNzA5NTQxNTgwfQ.l6b5xJgBDquD6AUsN1ubekx5hLyJjo45JghbiYb80WU",
   "messageId":"d82cc5a4-4856-4c6f-ac6b-0552344d665a",
   "refMessageId":"12f993f4-a25e-41e1-908d-0b85a4fba70e",
   "conversationId":"4eebcbf0-8334-4863-a2a4-35c7c60ef2a8","emoji":"👍"},"level":"INFO","type":"LOG"}
  */
}