import express from "express";
import DefaultController from "../controllers/defaultController";

const defaultRouter = express.Router();

defaultRouter.get("/status", async (_req, res) => {
  const controller = new DefaultController();
  const response = await controller.getStatusResponse()
  return res.send(response);
});

defaultRouter.get("/version", async (_req, res) => {
  const controller = new DefaultController();
  const response = await controller.getVersionResponse();
  return res.send(response);
});

export default defaultRouter;