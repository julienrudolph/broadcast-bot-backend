import express from "express";
import RomanController from "../controllers/roman.controller";

const romanRouter = express.Router();

romanRouter.post("/", async (req, res) => {
  const controller = new RomanController();
  const response = await controller.getRomanResponse(req.body, req.headers);
  if(response === "user_not_allowed"){
    return res.status(409).send("user_not_allowed");
  }
  return res.send(response);
});

export default romanRouter;