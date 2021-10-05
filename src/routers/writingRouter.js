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

writingRouter.get("/:id([0-9a-f]{24})", watch);
writingRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
writingRouter.get("/:id([0-9a-f]{24})/delete", deleteWriting);
writingRouter.get("/:id([0-9a-f]{24})/like", registerWritingLike);
writingRouter.post("/upload", authenticateAccessToken, postUpload);
writingRouter.post("/upload/imgs", imgsUpload.array("img", 10), postUploadImgs);

export default writingRouter;
