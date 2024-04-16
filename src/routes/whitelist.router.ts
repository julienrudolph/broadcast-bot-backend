import express from "express";
import WhitelistController from "../controllers/whitelist.controller";

const whitelistRouter = express.Router();

whitelistRouter.get("/get", async (_req, res) => {
  const controller = new WhitelistController();
  if(!_req.headers.authorization){
    return res.status(400).send('Missing authorization');
  }
  const response = await controller.getWhitelist(_req.headers);
  if(response === "Unauthorized"){
    return res.sendStatus(401);
  }else{
    if(response === "error"){
      return res.status(501).send("Cannot get whitelist. Nether internal error or something went wrong.");
    }else{
      return res.send(response);
    }
  }
});

whitelistRouter.post("/add", async (_req, res) => {
  const controller = new WhitelistController();
  if(!_req.headers.authorization){
    return res.status(400).send('Missing authorization');
  }
  const response = await controller.add(_req.body, _req.headers);
  switch (response) {
    case "Unauthorized":
      return res.status(401).send("unauthorized");
    case "error_mail_format":
      return res.status(501).send("entry is not a valid mail format");
    case "error_input":
      return res.status(501).send("input could not be read");  
    case "success":
      return res.status(200).send("success"); 
    default:
      return res.status(501).send("something went wrong");
  }
});


// todo implement renew function in controller --> send post with actual list 
// --> take all existing elements and delete them, take new list and add (one transaction)
whitelistRouter.post("/renewList", async (_req, res) => {
  const controller =  new WhitelistController();
  if(!_req.headers.authorization){
    return res.status(400).send('Missing authorization');
  }else{
    const response = await controller.renewList(_req.body, _req.header);
    switch(response){
      case 'error_while_transaction':
        return res.status(501).send("error while performing database operations");
      case 'error_json_input': 
        return res.status(501).send("invalid json");
      case 'error_not_authenticated':
        return res.status(401).send("unauthenticated"); 
      case 'error_mail_format':
        return res.status(501).send("error while checkng mail addresses")
      case 'success':
        return res.status(200).send('success');
      default:
        return res.status(501).send('something went wrong');
    }
  }
});


whitelistRouter.post("/delete", async (_req, res) => {
  const controller = new WhitelistController();
  if(!_req.headers.authorization){
    return res.status(400).send('Missing authorization');
  }
  const response = await controller.delete(_req.body, _req.headers);
  switch (response) {
    case "Unauthorized":
      return res.status(401).send("unauthorized");
    case "error_mail_format":
      return res.status(501).send("entry is not a valid mail format");
    case "error_input":
      return res.status(501).send("input could not be read");  
    case "success":
      return res.status(200).send("success"); 
    default:
      return res.status(501).send("something went wrong");
  }
});

export default whitelistRouter;