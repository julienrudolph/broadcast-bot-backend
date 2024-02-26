import { Get, Route, Tags, Post, Body, Path } from "tsoa";
import { Channel } from "../models";
import {
  getChannel,
  createChannel,
  getChannelById,
} from "../repositories/channel.repo";

@Route("channels")
@Tags("Channel")
export default class ChannelController {
  @Get("/")
  public async getChannel(): Promise<Array<Channel>> {
    return getChannel();
  }

  @Post("/")
  public async createChannel(@Body() body: Channel): Promise<Channel> {
    return createChannel(body);
  }

  @Get("/:id")
  public async getChannelById(@Path() id: string): Promise<Channel | null> {
    return getChannelById(parseInt(id));
  }
}