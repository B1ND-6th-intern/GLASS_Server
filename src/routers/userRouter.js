import express from "express";
import {
  postEdit,
  logout,
  see,
  postChangePassword,
  getEmailAuthorization,
  postEmailAuthorization,
} from "../controllers/userController";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.post("/edit", protectorMiddleware, postEdit);
userRouter.post("/change-password", protectorMiddleware, postChangePassword);
userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.get(":id", see);

export default userRouter;
