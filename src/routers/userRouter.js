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
  verifyToken,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

userRouter.post("/login", verifyToken, publicOnlyMiddleware, postLogin);
userRouter
  .route("/email-auth")
  .get(getEmailAuthorization)
  .post(postEmailAuthorization);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.post(
  "/edit",
  protectorMiddleware,
  avatarUpload.single("avatar"),
  postEdit
);
userRouter.post("/change-password", protectorMiddleware, postChangePassword);
userRouter.get(":id", see);

export default userRouter;
