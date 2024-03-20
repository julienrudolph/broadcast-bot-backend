export interface IConversationInit{
  type: string;
  botId: string;
  userId: string;
  conversationId: string;
  messageId: string;
  token: string;
  refMessageId?: string;
  text:{(data: string)};
} 

export interface IBody {
/*
      {"message":
      {"botId":"f917fa7d-39e3-4c3c-9960-5ed4115160dd",
      "type":"conversation.reaction",
      "userId":"9e54ce88-506e-43d7-b95b-af117d51000d",
      "token":"eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZjkxN2ZhN2QtMzllMy00YzNjLTk5NjAtNWVkNDExNTE2MGRkIiwiZXhwIjoxNzA5NTQxNTgwfQ.l6b5xJgBDquD6AUsN1ubekx5hLyJjo45JghbiYb80WU",
      "messageId":"d82cc5a4-4856-4c6f-ac6b-0552344d665a",
      "refMessageId":"12f993f4-a25e-41e1-908d-0b85a4fba70e",
      "conversationId":"4eebcbf0-8334-4863-a2a4-35c7c60ef2a8","emoji":"👍"},"level":"INFO","type":"LOG"}
    */
  botId: string;
  type: string;
  userId: string;
  token: string;
  messageId: string;
  refMessageId?: string;
  conversationId: string;

  
}

export interface IScimUserResponse {
  active: boolean;
  displayName: string;
  externalId: string;
  id: string;
  preferedLanguage: string;
}

export interface IBroadCast{
  broadcastId: string;
  report: [{
    type: string;
    count: number;
  }];
}

export interface IMessage{
  type: string;
  text: IData;
}

interface IData{
  data: string;
}

export interface IAttachmentMessage{ 
  botId: string,
  type: string,
  userId: string,
  token: string,
  messageId: string
  conversationId: string
  attachment: {
    data: string,
    name: string,
    mimeType: string,
    size: number,
    duration: null,
    levels: null,
    height: null,
    width: null,
    meta: {
      assetId: string,
      assetToken: string,
      sha256: string,
      otrKey: string,
    }
  }
}