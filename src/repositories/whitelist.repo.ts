import { connectDB } from '../config/database';
import { Whitelist } from '../models/whiteList';
import * as apputils from '../utils/app.utils';

  export const getWhitelist = async (): Promise<Whitelist[]> => {
    const whitelistRepository = connectDB.getRepository(Whitelist);
    return whitelistRepository.find();
  };

  export const saveWhitelist = async (payload: Whitelist[]): Promise<boolean> => {
    const whitelistRepo = connectDB.getRepository(Whitelist);
    let error = false;
    Promise.all(
      payload.map(async elem => {
        let entry:Whitelist = {
          mail: elem.mail
        }
        let result:Whitelist = null;
        await whitelistRepo.insert(entry);
        // result = await whitelistRepo.save(entry);
        if(result == null){
          error = true;
        }
      })
    ).then( async () => {
      apputils.setWhiteList();
    });
    return error;
  }

  export const deleteWhitelistEntries = async (payload: Whitelist[]): Promise<boolean> => {
    const whitelistRepo = connectDB.getRepository(Whitelist)
    let error = false;
    Promise.all(
      payload.map(elem => {
        let result = null;
        result = whitelistRepo.delete({mail: elem.mail});
        if(result == null){
          error = true;
        }
      })
    ).then(async () => {
      await apputils.setWhiteList();
    });
    return error;
  }

  export const renewWhitelist = async (payload: string[]): Promise<string> => {
    const whitelistRepo = connectDB.getRepository(Whitelist);
    // check if payload contains only valid mails
    let newList:Whitelist[] = [];
    if(payload && payload.length > 0){
      let mailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"; 
      payload.forEach(elem => {
        if(!elem.match(mailRegex)){
          return "error_mail_format";
        }
        newList.push({mail: elem});
      });
    }
    const queryRunner = connectDB.createQueryRunner();
    await queryRunner.connect();
    let currentList:Whitelist[] = await queryRunner.query("SELECT * FROM whitelist");    
    let actionList = [{
        action: "test",
        mail: "test"
    }]
    currentList.forEach(elem => {
        if(!newList.find(e => e.mail === elem.mail)){
            actionList.push({
                action: "delete",
                mail: elem.mail
            });
        }
    });
    newList.forEach(elem => {
        if(!currentList.find(e => e.mail === elem.mail)){
            actionList.push({
                action: "add",
                mail: elem.mail
            })
        }
    });
    actionList = actionList.slice(1,actionList.length);
    let error = false;
    try{ 
      await Promise.all(actionList.map(async (elem) => {
        if(elem.action === "add"){
          let entry:Whitelist = {
            mail: elem.mail
          }
          await queryRunner.manager.insert(Whitelist, {mail: elem.mail});  
        }else{
          await queryRunner.manager.delete(Whitelist, {mail: elem.mail});
        }
      }));
    }catch(err) {
      console.log(err);
      error = true;
    }
    if(error){
      await queryRunner.rollbackTransaction();
      return "error_while_transaction";
    }else{
      queryRunner.release();
      return 'success';
    }
  }