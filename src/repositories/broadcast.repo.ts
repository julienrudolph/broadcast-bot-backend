import { connectDB } from '../config/database';
import { BroadCast } from '../models/broadcast';

export const getBroadcast = async (): Promise<Array<BroadCast>> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  return broadcastRepository.find();
};

export const getBroadcastById = async (id:number): Promise<BroadCast> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  return broadcastRepository.findOne({where: {id: id}});
};

export const getLastBroadcast = async(): Promise<BroadCast> => {
  const broadcastRepository = connectDB.getRepository(BroadCast);
  return broadcastRepository.find();
}
