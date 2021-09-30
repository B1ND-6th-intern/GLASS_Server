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
import { authenticateAccessToken, avatarUpload } from "../middlewares";

const userRouter = express.Router();

userRouter.post("/login", authenticateAccessToken, postLogin);
userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.get("/logout", logout);
userRouter.post("/edit", avatarUpload.single("avatar"), postEdit);
userRouter.post("/change-password", postChangePassword);
userRouter.get(":id", see);

export default userRouter;
