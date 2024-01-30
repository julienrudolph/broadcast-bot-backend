import { Get, Route, Tags, Post, Body, Path } from "tsoa";
import { User } from "../models";
import {
  getUsers,
  createUser,
  getUserById,
} from "../repositories/user.repo";

@Route("users")
@Tags("User")
export default class UserController {
  @Get("/")
  public async getUsers(): Promise<Array<User>> {
    return getUsers();
  }

  @Post("/")
  public async createUser(@Body() body: User): Promise<User> {
    return createUser(body);
  }

  @Get("/:id")
  public async getUserById(@Path() id: string): Promise<User | null> {
    return getUserById(Number(id));
  }
}