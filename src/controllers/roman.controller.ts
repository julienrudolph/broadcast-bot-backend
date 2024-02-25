import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
// import axios from 'axios';

import * as Userrepo from '../repositories/user.repo';
import * as Channelrepo from '../repositories/channel.repo';
import * as Messagerepo from '../repositories/message.repo';

interface HandlerDto {
  body: any
  isUserAdmin: boolean
  appKey: string
}

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    let romanBase = 'https://proxy.services.wire.com/';
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
        await this.determmineHandler(true, body , appKey);
      }else{
        await this.determmineHandler(false, body, appKey);
      }        
    }
  }

  private async determmineHandler(isAdmin, body, appkey){
    const { type, userId, messageId } = body;
    if(type === "conversation.init"){

    }else{

    }

    if(isAdmin){
        
      }else{

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
  private userMessageToAdmin(){}

  private broadcastMessageToRoman(){}

  private getBroadcastStat(id: string){}

  private getHelp(isAdmin: boolean){}

}