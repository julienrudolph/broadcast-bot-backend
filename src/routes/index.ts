import express from "express";
import userRouter  from "../routes/user.router";
import channelRouter from "../routes/channel.router";
import defaultRouter from "./default.router";
import romanRouter from "./roman.router";

const router = express.Router();

router.use("/", defaultRouter);
router.use("/users", userRouter);
router.use("/channel", channelRouter);
router.use("/roman", romanRouter);

export default router;