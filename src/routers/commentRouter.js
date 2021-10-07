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
commentRouter.get("/:id([0-9a-f]{24})/edit", getEditComment);
commentRouter.post("/:id([0-9a-f]{24})/edit", postEditComment);
commentRouter.delete("/:id([0-9a-f]{24})", deleteComment);

export default commentRouter;
