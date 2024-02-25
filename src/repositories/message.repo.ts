import { connectDB } from '../config/database';
import { Message } from '../models/message';


  export const getMessages = async (): Promise<Array<Message>> => {
    const messageRepository = connectDB.getRepository(Message);
    return messageRepository.find();
  };
  
  export const createMessage = async (payload: Message): Promise<Message> => {
    const messageRepository = connectDB.getRepository(Message);
    const user = new Message();
    return messageRepository.save({
      ...user,
      ...payload,
    });
  };
  
  export const getMessageById = async (id: number): Promise<Message | null> => {
    const messageRepository = connectDB.getRepository(Message);
    const user = await messageRepository.findOne({where: {id: id}});
    if (!user) return null;
    return user;
  };