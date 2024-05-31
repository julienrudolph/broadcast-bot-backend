import * as ChannelToUserRepo from '../repositories/channelToUser.repo';
import * as UserRepo from '../repositories/user.repo';
import { ChannelToUser, BotUser } from '../models';
import { connectDB } from '../config/database';

let admins = process.env.ADMINS;
console.log(admins);
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
  const queryRunner = connectDB.createQueryRunner();
  await queryRunner.connect();
  console.log(adminUsers);
  let currentList:ChannelToUser[] = await queryRunner.manager.find(ChannelToUser, {where: {isAdmin: true}});
  console.log("CurrentList");
  console.log(currentList);

  console.log("Adminlist");
  console.log(adminUsers);
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
  console.log(actionList);
  try{
    actionList.forEach(async elem => {
    if(elem.action === "add"){
      await queryRunner.manager.update(ChannelToUser, elem.id , {isAdmin: true});
      // result = whitelistRepo.save(entry);  
    }else{
      await queryRunner.manager.update(ChannelToUser, elem.id, {isAdmin: false});
      // result = whitelistRepo.delete({mail: elem.mail}); 
    }
  });
  }catch(err) {
    await queryRunner.rollbackTransaction();
    return "error_while_transaction";
  }
}