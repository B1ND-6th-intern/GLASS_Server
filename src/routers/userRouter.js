import express from "express";
import {
  postEdit,
  logout,
  see,
  postChangePassword,
  getEmailAuthorization,
  postEmailAuthorization,
  postLogin,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  Token,
} from "../middlewares";

const userRouter = express.Router();

userRouter.post("/login", Token, postLogin);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.post("/edit", protectorMiddleware, postEdit);
userRouter.post("/change-password", protectorMiddleware, postChangePassword);
userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.get(":id", see);

export default userRouter;
