import express from "express";
import { postquestion } from "../controllers/questionController";

const questionRouter = express.Router();

questionRouter.get("question", postquestion);

export default questionRouter;
