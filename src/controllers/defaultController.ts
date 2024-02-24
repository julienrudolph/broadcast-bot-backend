import {
    Body, 
    Get, 
    Post, 
    Route
} from "tsoa";

interface ServiceResponse {
  message: string; 
}

@Route("/")
export default class DefaultController {
  @Get("/version")
  public async getVersionResponse(): Promise<ServiceResponse> {
    console.log()
    return {
      message: "development - 0.0.1"
    }
  }

  @Get("/status")
  public async getStatusResponse(): Promise<ServiceResponse> {
    console.log()
    return {
      message: "Running"
    }
  }
}

