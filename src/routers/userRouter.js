import express from "express";
import {
  postEdit,
  see,
  postChangePassword,
  getEmailAuthorization,
  postEmailAuthorization,
  getUserId,
  postEditAvatar,
} from "../controllers/userController";
import { avatarUpload, authenticateAccessToken } from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.post("/edit", authenticateAccessToken, postEdit);
userRouter.post(
  "/edit/avatar",
  authenticateAccessToken,
  avatarUpload.single("img"),
  postEditAvatar
);
userRouter.post(
  "/change-password",
  authenticateAccessToken,
  postChangePassword
);
userRouter.get("/user-id", authenticateAccessToken, getUserId);
userRouter.get("/:id", see);

export default userRouter;
