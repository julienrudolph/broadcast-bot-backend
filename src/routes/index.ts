import express from "express";
import PingController from "../controllers/ping";
import ServiceController from "../controllers/serviceController";
import userRouter  from "../routes/user.router";
import channelRouter from "../routes/channel.router";
const router = express.Router();

router.get("/",async (_req, res) => {
  const controller = new ServiceController();
  const response = await controller.getResponse();
  return res.send(response);
});

router.post("/", async (_req, res) => {
  const controller = new ServiceController();
  const response = await controller.getPostResponse(_req.body);
  return res.send(response);
});

router.get("/ping",async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.use("/users", userRouter);
router.use("/channels", channelRouter);

export default router;