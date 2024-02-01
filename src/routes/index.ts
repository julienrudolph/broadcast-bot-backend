import express from "express";
import PingController from "../controllers/ping";
import ServiceController from "../controllers/serviceController";
import userRouter  from "../routes/user.router";
import channelRouter from "../routes/channel.router";
import botsRouter from "./bots.router";

const router = express.Router();

router.get("/",async (_req, res) => {
  const controller = new ServiceController();
  const response = await controller.getResponse();
  return res.send(response);
});

router.post("/", async (_req, res) => {
  const controller = new ServiceController();
  const response = await controller.getTestPost(_req.body);
  console.log(_req);
  if(response){
    res.status(200);
    return res.send(response);
  }else{
    res.status(503);
  }
});

router.get("/ping",async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});


router.use("/users", userRouter);
router.use("/channel", channelRouter);
router.use("/bots", botsRouter);

export default router;