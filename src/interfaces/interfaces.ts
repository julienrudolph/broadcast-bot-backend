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