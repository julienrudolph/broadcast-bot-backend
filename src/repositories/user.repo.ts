import { connectDB } from '../config/database';
import { BotUser } from '../models/botUser';


  export const getUsers = async (): Promise<Array<BotUser>> => {
    const userRepository = connectDB.getRepository(BotUser);
    return userRepository.find();
  };
  
  export const createUser = async (payload: BotUser): Promise<BotUser> => {
    const userRepository = connectDB.getRepository(BotUser);
    const user = new BotUser();
    return userRepository.save({
      ...user,
      ...payload,
    });
  };
  
  export const getUserById = async (id: number): Promise<BotUser | null> => {
    const userRepository = connectDB.getRepository(BotUser);
    const user = await userRepository.findOne({where: {id: id}});
    if (!user) return null;
    return user;
  };

  export const getUserByWireId = async (id: string): Promise<BotUser | null> => {
    const userRepository = connectDB.getRepository(BotUser);
    const user = await userRepository.findOne({where: {userId: id}});
    if (!user) return null;
    return user;
  };

  export const removeUser = async(id: number): Promise<boolean | null> => {
    const userRepository = connectDB.getRepository(BotUser);
    const user = await userRepository.delete(id);
    if (!user) return null;
    return true;  
  }