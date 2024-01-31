import {
    Body, 
    Get, 
    Post, 
    Route
} from "tsoa";

interface ServiceResponse {
  message: string; 
}

interface PostResponse{
  message: string;
}

interface BotRequest{
    /*
    "type": "conversation.bot_request",
    "botId": "493ede3e-3b8c-4093-b850-3c2be8a87a95",  // Unique identifier for this bot
    "userId": "4dfc5c70-dcc8-4d9e-82be-a3cbe6661107", // User who requested this bot  
    "conversationId": "5dfc5c70-dcc8-4d9e-82be-a3cbe6661106",  // ConversationId 
    "conversation": "Bot Example Conversation",                // Conversation name
    "handle": "dejan_wire",  // username of the user who requested this bot
    "locale": "en_US",       // locale of the user who requested this bot    
    "token": "..."           // Access token. Store this token so the bot can post back later
    */
    type: string;
    botId: string;
    userId: string;
    conversationId: string;
    conversation: string;
    handle: string;
    locale: string;
    token: string;
    messageId: string;
    text: IText;
    attachment: IAttachment;

}

interface IMeta{
  assetId: string;
  assetToken: string
  sha256: string;
  otrKey: string;
}

interface IAttachment{
  size: number;
  mimeType: string;
  width: string;
  height: string;
  name: string;
  duration: number;
  levels: number[];
  meta: IMeta;

}

interface IText{
  data: string
}

interface EchoDemo{
    type: string;
    text: IText;
} 

@Route("/")
export default class ServiceController {
  @Get("/")
  public async getResponse(): Promise<ServiceResponse> {
    return {
      message: "Root"
    }
  }

  @Post("/")
  public async getPostResponse(@Body() body:BotRequest): Promise<BotRequest>{
    console.log(body);
    const request = body;
    // only respond to text events
    if (body.type === 'conversation.new_text') {
        // echo text back to the conversation by responding to a REST call from Roman
        body.type = 'text';
        body.text =  {data: `You said: ${body.text.data}`};
    }
    return body;
  }

  @Post("/")
  public async echoResponse(@Body() body:EchoDemo): Promise<EchoDemo>{
    console.log(body);
    const request = body;
    // only respond to text events
    if (body.type === 'conversation.new_text') {
        // echo text back to the conversation by responding to a REST call from Roman
        body.type = 'text';
        body.text =  {data: `You said: ${body.text.data}`};
    }
    return body;
  }

}

