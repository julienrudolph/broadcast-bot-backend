import express from "express";
import RomanController from "../controllers/roman.controller";

const romanRouter = express.Router();

romanRouter.post("/", async (req, res) => {
  const controller = new RomanController();
  const response = await controller.getRomanResponse(req.body, req.headers);
  return res.send(response);
});

export default romanRouter;