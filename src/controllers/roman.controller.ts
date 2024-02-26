import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as Messagerepo from '../repositories/message.repo';

import * as Utils from '../utils/wirebackend.utils';

import { User,Channel, ChannelToUser } from '../models';

import { IConversationInit, IScimUserResponse } from '../interfaces/interfaces';
 
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

let admins = "55150f06-c2a4-4c29-b99d-b08afe608172";
let appKey = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZDBjZmY5YzctMGIwOS00NjM4LWFiYjUtODFlZDA0ODc1NmIwIn0.qWevLrDlJA_tf46Vw5FC7wzwP93RmqlHRNY62sCRGV8";
let bearer = "Bearer km7a5l5VEIAXD-N_61_Xo-wh";

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    romanBase = romanBase.endsWith('/') ? romanBase : `${romanBase}/`;
    const romanBroadcast = `${romanBase}api/broadcast`;
  
    // const { admins, appKey } = await getConfigurationForAuth(authorizationToken);
    console.log(body);
    console.log(header)

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
      return this.handleInit(isAdmin, body);
    }
    if(type === "conversation.new_text"){
      return this.handleText(isAdmin, body, appKey);
    }
    if(type === "conversation.bot_request"){
      /* 
        toDo implement strategy with handle
        {
          "type": "conversation.bot_request",
          "botId": "493ede3e-3b8c-4093-b850-3c2be8a87a95",  // Unique identifier for this bot
          "userId": "4dfc5c70-dcc8-4d9e-82be-a3cbe6661107", // User who requested this bot  
          "conversationId": "5dfc5c70-dcc8-4d9e-82be-a3cbe6661106",  // ConversationId 
          "conversation": "Bot Example Conversation",                // Conversation name
          "handle": "dejan_wire",  // username of the user who requested this bot
          "locale": "en_US",       // locale of the user who requested this bot    
          "token": "..."           // Access token. Store this token so the bot can post back later
        }
        */ 
    }
    if(type === "conversation.asset.preview"){
      return this.handleAssetPreview();
    }
  }

  // toDo implement admin receives message from channel member
  private async handleText(isAdmin: boolean, body: any, appKey: string){
    const {text, userId , messageId} = body;
    const messageText:string = text?.data ?? '';
    if(isAdmin){
        if(messageText.startsWith("/help")){
          console.log("/help");
          return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos\n " +
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
          let broadCastId = text.split(" ")[1];
          return this.getBroadcastStat(broadCastId);
        }
        else if(messageText.startsWith("/last")){
          return this.getBroadcastStat();
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
        console.log("/help");
        return ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos\n " +
                                              "/info - zeigt Informationen über den Kanal\n"   
                                      }
                });        
      }
      else if(messageText.startsWith("/info")){
        return ({type: 'text', text: {data: "Dev-Channel der Fraktion. Sie sind Administrator"}})
      }
      else{
        return ({type: 'text', text: {data: "Haben Sie eine Kommando vergessen? Diese Nachricht wurde nicht versand und wird nicht protokolliert."}})
      }
    } 
  }

  private async handleAssetPreview(){

  };

  private async handleInit(isAdmin: boolean, body): Promise<IMessage> {
    /* let userInfo:IScimUserResponse = await Utils.getUserRichInfosById(body.userId);
    let user:User = {
      displayName: userInfo.displayName,
      email: userInfo.externalId,
      userId: userInfo.id,
      createdAt: (new Date),
      updatedAt: (new Date)
    }
    let channel = await Channelrepo.getChannelByBotId(body.botId);
    let existUser = await Userrepo.getUserByWireId(body.userId);
    if(!existUser){
      Userrepo.createUser(user);
    }
    let channeToUser:ChannelToUser = {
      conversationId: body.conversationId,
      isAdmin: isAdmin,
      isApproved: true,
      isMuted: false,
      user: existUser,
      channel: channel
    }
    console.log(userInfo);
    */

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

  private async handleUserMessage(message: string, appKey: string, userId: string, messageId: string){
    const romanMessageUri = romanBase + "api/message";
    let recipients = admins.split(","); 
    recipients.forEach(element => {
      try{
        let userMessage = ({
          type: 'text', 
          text: {data: message}
        })
        fetch(
          romanMessageUri, {
            headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
            body: JSON.stringify(message) 
          }
        )
      }catch(e){
        console.log(e)
      }  
    });
  }

  private async broadCastMessage(message: string, appKey: string, userId: string, messageId: string){
    try {
      let broadCastMessage:IMessage = ({type: 'text', text: {data: message}})
      const broadCastId = await this.broadCastToWire(broadCastMessage, appKey); 
    }catch(e){
      console.log(e);
    }
  }

  private async broadCastToWire(message: IMessage, appKey: string){
    const romanBroadcastUri = romanBase + "api/broadcast";
    let broadCastResult = await fetch(
      romanBroadcastUri,
      {
        method: 'POST',
        headers: {'app-key': appKey, 'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(message)
      }    
    ).then(res => {

      console.log(res);
    });
    return "";
  }

  private getBroadcastStat(id?: string){}

  private getHelp(isAdmin: boolean){}

  
}