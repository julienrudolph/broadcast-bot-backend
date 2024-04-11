import { connectDB } from '../config/database';
import { Whitelist } from '../models/whiteList';


  export const getWhitelist = async (): Promise<Array<Whitelist>> => {
    const whitelistRepository = connectDB.getRepository(Whitelist);
    return whitelistRepository.find();
  };

  export const saveWhitelist = async (payload: Whitelist[]): Promise<boolean> => {
    const whitelistRepo = connectDB.getRepository(Whitelist);
    console.log("Payload");
    let error = false;
    payload.forEach(elem => {
      console.log(elem);
      let entry:Whitelist = {
        mail: elem.mail
      }
      let result = null;
      result = whitelistRepo.save(entry);
      if(result == null){
        error = true;
      }
    });
    return error;
  }

  export const deleteWhitelistEntries = async (payload: Whitelist[]): Promise<boolean> => {
    const whitelistRepo = connectDB.getRepository(Whitelist)
    let error = false;
    payload.forEach(elem => {
      let result = null;
      result = whitelistRepo.delete({mail: elem.mail});
      if(result == null){
        error = true;
      }
    });
    return error;
  }