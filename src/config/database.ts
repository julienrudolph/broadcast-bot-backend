import { DataSource } from "typeorm";
import {User, Channel, ChannelToUser} from "../models";
import * as dotenv from "dotenv";

dotenv.config();

console.log("dotenv: " + process.env.TEST);
export const connectDB = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
    entities: [User, Channel, ChannelToUser],
    synchronize: true,
});

/*const config: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "postgres",
  entities: [],
  synchronize: true,
};*/

export default connectDB;