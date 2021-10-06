import express from "express";
import {
  postEdit,
  see,
  postChangePassword,
  getEmailAuthorization,
  postEmailAuthorization,
} from "../controllers/userController";
import { avatarUpload, authenticateAccessToken } from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.post("/edit", avatarUpload.single("avatar"), postEdit);
userRouter.post(
  "/change-password",
  authenticateAccessToken,
  postChangePassword
);
userRouter.get(":id", see);

export default userRouter;
