import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
import {Axios} from 'axios';

import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as Messagerepo from '../repositories/message.repo';

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

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    romanBase = romanBase.endsWith('/') ? romanBase : `${romanBase}/`;
    const romanBroadcast = `${romanBase}api/broadcast`;
  
    // const { admins, appKey } = await getConfigurationForAuth(authorizationToken);
    const admins = "55150f06-c2a4-4c29-b99d-b08afe608172"
    const appKey = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZDBjZmY5YzctMGIwOS00NjM4LWFiYjUtODFlZDA0ODc1NmIwIn0.qWevLrDlJA_tf46Vw5FC7wzwP93RmqlHRNY62sCRGV8"
    console.log(body);
    console.log(header)

    const { type, userId, messageId } = body;

    if(header.authorization === appKey){
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
      this.handleInit(isAdmin);
    }
    if(type === "conversation.new_text"){
      this.handleText(isAdmin, body, appKey);
    }
  }

  /*
    cases:

    user is admin 
      --> implement actions for keywords
        - Keywords
          - /broadcast <Message> - broadcast message to roman
          - /help - return messages to user with commands
          - /stats - return sending stats of last broadcast (RC2 /stats broadcastID)
    user is member
      --> implement keywords
        - /help - returns message to user with commands 
        - /info - return infos concerning bot    
   */   


  // toDo implement admin receives message from channel member
  private async handleText(isAdmin: boolean, body: any, appKey: string){
    let message;
    const {text, userId , messageId} = body;
    const messageText:string = text?.data ?? '';
    if(isAdmin){
        if(text.startsWith("/help")){
          return  ({type: 'text', text: {data : "/help - zeigt die Liste der Kommandos\n " +
                                                "/broadcast <Nachricht> - erzeugt eine Broadcast Nachricht\n" +
                                                "/last - zeigt die Statistik des letzten Broadcast an \n" +
                                                "/stats <ID> - erzeugt eine Broadcast Nachricht\n" +
                                                "/info - zeigt Informationen über den Kanal\n"   
                                        }
                  });        
        }
        else if(text.startsWith("/info")){
          return ({type: 'text', text: {data: "Dev-Channel der Fraktion. Sie sind Administrator"}})
        }
        else if(text.startsWith("/stats")){
          let broadCastId = text.split(" ")[1];
          return this.getBroadcastStat(broadCastId);
        }
        else if(text.startsWith("/last")){
          return this.getBroadcastStat();
        }
        else if(text.startsWith("/broadcast")){
          const broadCast = messageText.substring(10);
          return this.broadCastMessage(broadCast, appKey, userId, messageId);
        }
        else{
          return ({type: 'text', text: {data: "Haben Sie eine Kommando vergessen? Diese Nachricht wurde nicht versand und wird nicht protokolliert."}})
        }
    }else{
      // toDo send user message to admins and return information for user
    } 
  }

  private async handleInit(isAdmin: boolean): Promise<IMessage> {
    // ToDo convert messages to parameter
    const helpMessageUser = "Sie haben den Dev-Channel der Fraktion abonniert.\n\n" +
                            "/help - zeigt die Liste der Kommandos\n " +
                            "/info - zeigt Informationen über den Kanal\n" ;
    const helpMessageAdmin = "Sie haben den Dev-Bot der Fraktion abonniert.\n\n" +
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