import { connectDB } from '../config/database';
import { Whitelist } from '../models/whiteList';

  export const getWhitelist = async (): Promise<Array<Whitelist>> => {
    const whitelistRepository = connectDB.getRepository(Whitelist);
    return whitelistRepository.find();
  };

  export const saveWhitelist = async (payload: Whitelist[]): Promise<boolean> => {
    const whitelistRepo = connectDB.getRepository(Whitelist);
    let error = false;
    payload.forEach(elem => {
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

  export const renewWhitelist = async (payload: string[]): Promise<string> => {
    const whitelistRepo = connectDB.getRepository(Whitelist);
    // check if payload contains only valid mails
    let addArray:Whitelist[] = [];
    if(payload && payload.length > 0){
      let mailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"; 
      payload.forEach(elem => {
        if(!elem.match(mailRegex)){
          return "error_mail_format";
        }
        addArray.push({mail: elem});
      });
    }
    const queryRunner = connectDB.createQueryRunner();
    await queryRunner.connect();
    let tmp:Whitelist[] = await queryRunner.query("SELECT * FROM whitelist");
    await queryRunner.startTransaction()
    try {
      tmp.forEach(async elem => {
        await queryRunner.manager.delete(elem);
      });  
      await queryRunner.manager.save(addArray);
      await queryRunner.commitTransaction();
    } catch (err) {
        await queryRunner.rollbackTransaction();
        return "error_while_transaction";
    } finally {
        await queryRunner.release();
        return "success";
    }
  }