import express, { Application } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import Router from "./routes";
import dataSource from "./config/database";

import * as dotenv from "dotenv";

dotenv.config();

// const PORT = process.env.PORT || 8888;
const PORT = 8888;
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

app.use(Router);
// Hallo du da
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});