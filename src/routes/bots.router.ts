import express from "express";
import ServiceController from "../controllers/serviceController";

const botsRouter = express.Router();

botsRouter.post("/(*)?", async (_req, res) => {
  const controller = new ServiceController();
  const response = await controller.getTestPost(_req.body);
  return res.send(response);
});

export default botsRouter;