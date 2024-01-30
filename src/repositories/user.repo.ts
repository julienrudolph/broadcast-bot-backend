import { connectDB } from '../config/database';
import { User } from '../models/user';


export const getUsers = async (): Promise<Array<User>> => {
    const userRepository = connectDB.getRepository(User);
    return userRepository.find();
  };
  
  export const createUser = async (payload: User): Promise<User> => {
    const userRepository = connectDB.getRepository(User);
    const user = new User();
    return userRepository.save({
      ...user,
      ...payload,
    });
  };
  
  export const getUser = async (id: number): Promise<User | null> => {
    const userRepository = connectDB.getRepository(User);
    const user = await userRepository.findOne({where: {id: id}});
    if (!user) return null;
    return user;
  };

  export const addUserToBot = async (userId: number, botId: number): Promise<boolean> => {
    return true;
  } 