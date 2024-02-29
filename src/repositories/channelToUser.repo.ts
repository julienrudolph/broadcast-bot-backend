import { connectDB } from '../config/database';
import { ChannelToUser, User } from '../models';


  export const getAllChannelToUsers = async (): Promise<Array<ChannelToUser>> => {
    const channelToUserRepo = connectDB.getRepository(ChannelToUser);
    return channelToUserRepo.find();
  };
  
  export const createChannelToUser = async (payload: ChannelToUser): Promise<ChannelToUser> => {
    const channelToUserRepo = connectDB.getRepository(ChannelToUser);
    const user = new ChannelToUser();
    return channelToUserRepo.save({
      ...user,
      ...payload,
    });
  };
  
  export const getChannelToUserById = async (id: number): Promise<ChannelToUser | null> => {
    const channelToUserRepo = connectDB.getRepository(ChannelToUser);
    const user = await channelToUserRepo.findOne({where: {id: id}});
    if (!user) return null;
    return user;
  };

  export const getChannelToUserByWireUserId = async (id: number): Promise<ChannelToUser | null> => {
    const channelToUserRepo = connectDB.getRepository(ChannelToUser);
    const user = await channelToUserRepo.findOne({where: {userId: id}});
    if (!user) return null;
    return user;
  };