import { Get, Route, Tags, Post, Body, Path } from "tsoa";
import { BotUser } from "../models";
import {
  getUsers,
  createUser,
  getUserById,
} from "../repositories/user.repo";

@Route("users")
@Tags("User")
export default class UserController {
  @Get("/")
  public async getUsers(): Promise<Array<BotUser>> {
    return getUsers();
  }

  @Post("/")
  public async createUser(@Body() body: BotUser): Promise<BotUser> {
    return createUser(body);
  }

  @Get("/:id")
  public async getUserById(@Path() id: string): Promise<BotUser | null> {
    return getUserById(Number(id));
  }
}