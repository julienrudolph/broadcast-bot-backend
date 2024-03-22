import express from "express";
import UserController from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/", async (_req, res) => {
  const controller = new UserController();
  const response = await controller.getUsers();
  return res.send(response);
});

userRouter.post("/", async (req, res) => {
  const controller = new UserController();
  const response = await controller.createUser(req.body);
  return res.send(response);
});

userRouter.get("/:id", async (req, res) => {
  const controller = new UserController();
  const response = await controller.getUserById(req.params.id);
  if (!response) res.status(404).send({ message: "No user found" });
  return res.send(response);
});

export default userRouter;
