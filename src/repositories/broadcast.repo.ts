import { connectDB } from '../config/database';
import { BroadCast } from '../models/broadcast';

export const getBroadcast = async (): Promise<Array<BroadCast>> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  return broadcastRepository.find();
};

export const getLastBroadcast = async (): Promise<BroadCast | null> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  let temp:BroadCast[] = await broadcastRepository.find({
    order: {
        createdAt: "DESC"
    },
  });
  if(temp.length > 0){
    return temp[0]
  }
  return null;
}

export const getBroadcastById = async (id:number): Promise<BroadCast> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  return broadcastRepository.findOne({where: {id: id}});
};

export const createBroadcast = async (payload: BroadCast): Promise<BroadCast> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  const broadCast = new BroadCast();
  return broadcastRepository.save({
    ...broadCast,
    ...payload,
  });
};
