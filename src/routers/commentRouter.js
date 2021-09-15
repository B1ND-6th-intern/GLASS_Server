import express from "express";
import {
  registerCommentLike,
  postUploadComment,
  getEditComment,
  postEditComment,
  deleteComment,
} from "../controllers/writingController";

const commentRouter = express.Router();

commentRouter.get("/:id([0-9a-f]{24})/like", registerCommentLike);
commentRouter.post("/:id([0-9a-f]{24})/upload", postUploadComment);
commentRouter.get("/:id([0-9a-f]{24})/edit", getEditComment);
commentRouter.post("/:id([0-9a-f]{24})/edit", postEditComment);
commentRouter.delete("/:id([0-9a-f]{24})", deleteComment);

export default commentRouter;
