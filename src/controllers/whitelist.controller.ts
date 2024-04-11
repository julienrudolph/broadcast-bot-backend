import {Get, Post, Route, Tags, Body, Header} from "tsoa";
import * as WhitelistRepo from "../repositories/whitelist.repo";

import {Whitelist} from '../models';

let bearer:string = "SGFsbG8gV2VsdAo="

@Route("json")
@Tags("json")
export default class WhitelistController {

  private async isAuthenticated(bearerHeader:string){
    if(bearer === bearerHeader){
      return true;
    }
    return false;
  }

  @Get("/")
  public async getWhitelist(@Header() header:any): Promise<any> {
    if(this.isAuthenticated(header.authorization)){
      // do stuff;
      let whitelist = await WhitelistRepo.getWhitelist();
      if(whitelist && whitelist.length > 0){
        return JSON.stringify(whitelist);
      }else{
        if(whitelist && whitelist.length == 0){
          return "no entries in whitelist";
        }else{
          return "error";
        }
      }
    }else{
      return "Unauthorized";
    }
  }

  @Post("/add")
  public async add(@Body() body: any, @Header() header:any): Promise<any> {
    if(this.isAuthenticated(header.authorization)){
      let whitelist = body;
      if(whitelist && whitelist.length > 0){
        let mailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        let addArray:Whitelist[] = [];
        let existingWhitelist = await WhitelistRepo.getWhitelist();
        console.log(existingWhitelist);
        whitelist.forEach(elem => {
          if(!elem.match(mailRegex)){
            return "error_mail_format";
          }
          if(!existingWhitelist.find(item => {return item.mail === elem})){
              addArray.push({
              mail: elem
            });
          }
        });
        let tmp = await WhitelistRepo.saveWhitelist(addArray);
        console.log(tmp); 
        return "success";

      }else{
        return "error_input";
      }
      
      // WhitelistRepo.saveWhitelist()
    }else{
      return "Unauthorized";
    }
  } 

  @Post("/delete")
  public async delete(@Body() body: any, @Header() header:any): Promise<any> {
    if(this.isAuthenticated(header.authorization)){
      let whitelist = body;
      if(whitelist && whitelist.length > 0){
        let mailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        let addArray:Whitelist[] = [];
        let existingWhitelist = await WhitelistRepo.getWhitelist();
        whitelist.forEach(elem => {
          if(!elem.match(mailRegex)){
            return "error_mail_format";
          }
          if(existingWhitelist.find(item => {return item.mail === elem})){
            addArray.push({
            mail: elem
          });
        }
        });
        let tmp = await WhitelistRepo.deleteWhitelistEntries(addArray); 
        console.log(tmp);
        return "success";
      }else{
        return "error_input";
      }
    }else{
      return "Unauthorized";
    }
  }
}

