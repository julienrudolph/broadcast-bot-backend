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

export interface IScimUserResponse {
  active: boolean;
  displayName: string;
  externalId: string;
  id: string;
  preferedLanguage: string;
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