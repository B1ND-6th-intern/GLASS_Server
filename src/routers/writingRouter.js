import express from "express";
import {
  watch,
  postUpload,
  getEdit,
  postEdit,
  deleteWriting,
  registerWritingLike,
} from "../controllers/writingController";
import { protectorMiddleware } from "../middlewares";

const writingRouter = express.Router();

writingRouter.get("/:id([0-9a-f]{24})", watch);
writingRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
writingRouter.get(
  "/:id([0-9a-f]{24})/delete",
  protectorMiddleware,
  deleteWriting
);
writingRouter.get("/:id([0-9a-f]{24})/like", registerWritingLike);
writingRouter.post("/upload", protectorMiddleware, postUpload);

export default writingRouter;
