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
  .route("/edit/:id([0-9a-f]{24})")
  .all(authenticateAccessToken)
  .get(getEdit)
  .post(postEdit);
writingRouter.delete(
  "/delete/:id([0-9a-f]{24})",
  authenticateAccessToken,
  deleteWriting
);
<<<<<<< HEAD
writingRouter.post("/like/:id([0-9a-f]{24})", registerWritingLike);
=======
writingRouter.get("/like/:id([0-9a-f]{24})", registerWritingLike);
>>>>>>> 3d92541c906c0623d33a43c7133b10259780f49c
writingRouter.post("/upload", authenticateAccessToken, postUpload);
writingRouter.post("/upload/imgs", imgsUpload.array("img", 10), postUploadImgs);

export default writingRouter;
