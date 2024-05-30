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
    /*
       let tmp:number[] = await queryRunner.query("SELECT id FROM whitelist");
       await queryRunner.startTransaction();
       try{
        await queryRunner.manager.delete({id: in(tmp)});
       }
    */
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
  try{
    actionList.forEach(async elem => {
    if(elem.action === "add"){
      let entry:Whitelist = {
        mail: elem.mail
      }
      await queryRunner.manager.insert(Whitelist, {mail: elem.mail});
      // result = whitelistRepo.save(entry);  
    }else{
      await queryRunner.manager.delete(Whitelist, {mail: elem.mail});
      // result = whitelistRepo.delete({mail: elem.mail}); 
    }
  });
  }catch(err) {
      await queryRunner.rollbackTransaction();
      return "error_while_transaction";
    }finally{
      // await queryRunner.release();
        return "success";
    }
    /*await queryRunner.startTransaction();
    try {
      tmp.forEach(async elem => {
        // await EmployeeAnswers.delete({ id: In(ids.employeeAnswersIds) });
        await queryRunner.manager.remove({id: elem.id});
      });  
      await queryRunner.manager.save(addArray);
      await queryRunner.commitTransaction();
    } catch (err) {
        await queryRunner.rollbackTransaction();
        return "error_while_transaction";
    } finally {
        await queryRunner.release();
        return "success";
    }*/

  }