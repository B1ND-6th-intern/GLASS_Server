import express from "express";
import {
  watch,
  postUpload,
  getEdit,
  postEdit,
  deleteWriting,
  registerWritingLike,
  postUploadImgs,
} from "../controllers/writingController";
import { imgsUpload, authenticateAccessToken } from "../middlewares";

const writingRouter = express.Router();

writingRouter.get("/:id([0-9a-f]{24})", authenticateAccessToken, watch);
writingRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(authenticateAccessToken)
  .get(getEdit)
  .post(postEdit);
writingRouter.delete(
  "/:id([0-9a-f]{24})/delete",
  authenticateAccessToken,
  deleteWriting
);
writingRouter.get("/:id([0-9a-f]{24})/like", registerWritingLike);
writingRouter.post("/upload", authenticateAccessToken, postUpload);
writingRouter.post("/upload/imgs", imgsUpload.array("img", 10), postUploadImgs);

export default writingRouter;
