import express from "express";
import WhitelistController from "../controllers/whitelist.controller";

const whitelistRouter = express.Router();

whitelistRouter.get("/csv", async (_req, res) => {
  const controller = new WhitelistController();
  if(!_req.headers.authorization){
    return res.status(400).send('Missing authorization');
  }
  const response = await controller.getCsv(_req.headers);
  if(response === "Unauthorized"){
    return res.sendStatus(401);
  }else{
    return res.send(response);
  }
});

export default whitelistRouter;