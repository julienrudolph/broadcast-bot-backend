import {Get, Route, Tags, Body, Header} from "tsoa";


let bearer:string = "SGFsbG8gV2VsdAo="

@Route("csv")
@Tags("csv")
export default class WhitelistController {
  @Get("/csv")
  public async getCsv(@Header() header:any): Promise<any> {
    if(header.authorization === bearer){
      // do stuff;
      console.log("Authorized")
      return "authorized";
    }else{
      return "Unauthorized";
    }
  }
}