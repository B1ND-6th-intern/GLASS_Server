import express from "express";
import {
  postUploadComment,
  getEditComment,
  postEditComment,
  deleteComment,
} from "../controllers/writingController";
import { authenticateAccessToken } from "../middlewares";

const commentRouter = express.Router();

commentRouter.post("/upload", authenticateAccessToken, postUploadComment);
commentRouter.get(
  "/edit/:id([0-9a-f]{24})",
  authenticateAccessToken,
  getEditComment
);
commentRouter.post(
  "/edit/:id([0-9a-f]{24})",
  authenticateAccessToken,
  postEditComment
);
commentRouter.delete(
  "/:id([0-9a-f]{24})",
  authenticateAccessToken,
  deleteComment
);

export default commentRouter;
