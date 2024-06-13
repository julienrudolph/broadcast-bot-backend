import * as ChannelToUserRepo from '../repositories/channelToUser.repo';
import * as UserRepo from '../repositories/user.repo';
import { ChannelToUser, BotUser, Whitelist } from '../models';
import { connectDB } from '../config/database';
import { getWhitelist } from '../repositories/whitelist.repo';


let admins = process.env.ADMINS;

export var whitelist:Whitelist[];

export let setWhiteList = async (newList?:Whitelist[]) => {
  if(newList && newList.length > 0){
    whitelist = newList;
  }else{
    whitelist = await getWhitelist();
  }
}

export const validateAdminsInDatabase = async () => {
  let actionList = [];
  let adminUsers:BotUser[] = [];
  let array = admins.split(",");
  await Promise.all(array.map(async (elem) => {
    let tmp:BotUser = await UserRepo.getUserByWireId(elem); 
      if(tmp){
        adminUsers.push(tmp); 
      }
  }));
  if(adminUsers.length > 0){
    const queryRunner = connectDB.createQueryRunner();
    await queryRunner.connect();
    let currentList:ChannelToUser[] = await queryRunner.manager.find(ChannelToUser, {where: {isAdmin: true}});
    if(currentList.length > 0){
      currentList.forEach(elem => {
          if(!adminUsers.find(e => e.id === elem.userId)){
              actionList.push({
                  action: "remove",
                  id: elem.id
              });
          }
      });
      adminUsers.forEach(elem => {
          if(!currentList.find(e => e.userId === elem.id)){
              actionList.push({
                  action: "add",
                  id: elem.id
              })
          }
      });
      try{
        Promise.all(
          actionList.map(async elem => {
          if(elem.action === "add"){
            await queryRunner.manager.update(ChannelToUser, elem.id , {isAdmin: true});
            // result = whitelistRepo.save(entry);  
          }else{
            await queryRunner.manager.update(ChannelToUser, elem.id, {isAdmin: false});
            // result = whitelistRepo.delete({mail: elem.mail}); 
          }
        }));
      }catch(err) {
        await queryRunner.rollbackTransaction();
        return "error_while_transaction";
      }
    }
  }
}