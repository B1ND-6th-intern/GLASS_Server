import express from "express";
import { postJoin, postLogin, search } from "../controllers/userController";
import { getPosts } from "../controllers/writingController";
import { postquestion } from "../controllers/questionController";

const rootRouter = express.Router();

rootRouter.get("/posts", getPosts);
rootRouter.post("/join", postJoin);
rootRouter.post("/login", postLogin);
rootRouter.get("/search", search);
rootRouter.get("/question", postquestion);

export default rootRouter;
