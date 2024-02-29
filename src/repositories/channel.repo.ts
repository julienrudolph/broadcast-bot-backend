import { connectDB } from '../config/database';
import { Channel } from '../models/channel';


  export const getChannel = async (): Promise<Array<Channel>> => {
    const channelRepository = connectDB.getRepository(Channel);
    return channelRepository.find();
  };
  
  export const createChannel = async (payload: Channel): Promise<Channel> => {
    const channelRepository = connectDB.getRepository(Channel);
    const channel = new Channel();
    return channelRepository.save({
      ...channel,
      ...payload,
    });
  };
  
  export const getChannelById = async (id: number): Promise<Channel | null> => {
    const channelRepository = connectDB.getRepository(Channel);
    const channel = await channelRepository.findOne({where: {id: id}});
    if (!channel) return null;
    return channel;
  };

  export const getChannelByBotId = async (id: string): Promise<Channel | null> => {
    const channelRepository = connectDB.getRepository(Channel);
    const channel = await channelRepository.findOne({where: {botId: id}});
    if (!channel) return null;
    return channel;
  };