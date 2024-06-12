import express, { Application } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import Router from "./routes";
import dataSource from "./config/database";

import * as dotenv from "dotenv";

import * as util from './utils/app.utils';

dotenv.config();

const PORT = process.env.PORT;
const app: Application = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

dataSource.initialize()
  .then(() => {
    console.log(`Data Source has been initialized`);
  })
  .catch((err) => {
    console.error(`Data Source initialization error`, err);
  })

setTimeout(async () => {
  util.validateAdminsInDatabase();
  util.setWhiteList();
}, 5000);




app.use(Router);
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});