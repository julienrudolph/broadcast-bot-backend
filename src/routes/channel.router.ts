import express from "express";
import ChannelController from "../controllers/channel.controller";

const channelRouter = express.Router();

channelRouter.get("/", async (_req, res) => {
  const controller = new ChannelController();
  const response = await controller.getChannel();
  return res.send(response);
});

channelRouter.post("/", async (req, res) => {
  const controller = new ChannelController();
  const response = await controller.createChannel(req.body);
  return res.send(response);
});

channelRouter.get("/:id", async (req, res) => {
  const controller = new ChannelController();
  const response = await controller.getChannelById(req.params.id);
  if (!response) res.status(404).send({ message: "No channel found" });
  return res.send(response);
});

export default channelRouter;