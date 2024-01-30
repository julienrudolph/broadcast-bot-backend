import { connectDB } from '../config/database';
import { Channel } from '../models/channel';


export const getChannel = async (): Promise<Array<Channel>> => {
    const channelRepository = connectDB.getRepository(Channel);
    return channelRepository.find();
  };
  
  export const createChannel = async (payload: Channel): Promise<Channel> => {
    const channelRepository = connectDB.getRepository(Channel);
    const user = new Channel();
    return channelRepository.save({
      ...user,
      ...payload,
    });
  };
  
  export const getChannelById = async (id: number): Promise<Channel | null> => {
    const channelRepository = connectDB.getRepository(Channel);
    const user = await channelRepository.findOne({where: {id: id}});
    if (!user) return null;
    return user;
  };