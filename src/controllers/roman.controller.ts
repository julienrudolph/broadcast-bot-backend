import { Get, Route, Tags, Post, Body, Path, Header } from "tsoa";
// import axios from 'axios';

interface HandlerDto {
  body: any
  isUserAdmin: boolean
  appKey: string
}

@Route("roman")
@Tags("Roman")
export default class RomanController {
  @Post("/")
  public async getRomanResponse(@Body() body: any, @Header() header: any ): Promise<any> {
    let romanBase = 'https://proxy.services.wire.com/';
    romanBase = romanBase.endsWith('/') ? romanBase : `${romanBase}/`;
    const romanBroadcast = `${romanBase}api/broadcast`;
  
    // const { admins, appKey } = await getConfigurationForAuth(authorizationToken);
    const admins = "55150f06-c2a4-4c29-b99d-b08afe608172"
    const appKey = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3dpcmUuY29tIiwic3ViIjoiZDBjZmY5YzctMGIwOS00NjM4LWFiYjUtODFlZDA0ODc1NmIwIn0.qWevLrDlJA_tf46Vw5FC7wzwP93RmqlHRNY62sCRGV8"
    console.log(body);
    console.log(header)
  }
}