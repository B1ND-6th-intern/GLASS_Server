import express from "express";
import {
  watch,
  getUpload,
  postUpload,
  getEdit,
  postEdit,
  deleteWriting,
} from "../controllers/writingController";
import { protectorMiddleware } from "../middlewares";

const writingRouter = express.Router();

writingRouter.get("/:id([0-9a-f]{24})", watch);
writingRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
writingRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteWriting);
writingRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(postUpload);

export default writingRouter;
