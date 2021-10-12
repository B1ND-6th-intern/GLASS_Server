import express from "express";
import { postquestion } from "../controllers/questionController";

const questionRouter = express.Router();

questionRouter.route("/post-question").post(postquestion);

export default questionRouter;
