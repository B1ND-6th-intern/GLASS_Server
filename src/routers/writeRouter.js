import express from "express";
import {
  watch,
  getUpload,
  postUpload,
  getEdit,
  postEdit,
  deleteWrite,
} from "../controllers/writeController";

const writeRouter = express.Router();

writeRouter.get("/:id([0-9a-f]{24})", watch);
writeRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
writeRouter.route("/:id([0-9a-f]{24})/delete").get(deleteWrite);
writeRouter.route("/upload").get(getUpload).post(postUpload);

export default writeRouter;
