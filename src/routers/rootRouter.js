import express from "express";
import { postJoin, postLogin, search } from "../controllers/userController";
import {
  getInfiniteScrollPosts,
  getPosts,
  postQuestion,
  getPopularPosts,
} from "../controllers/writingController";
import { authenticateAccessToken } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/posts", authenticateAccessToken, getPosts);
rootRouter.get("/posts/popular", getPopularPosts);
rootRouter.get(
  "/posts/:index",
  authenticateAccessToken,
  getInfiniteScrollPosts
);
rootRouter.post("/join", postJoin);
rootRouter.post("/login", postLogin);
rootRouter.get("/search", search);
rootRouter.post("/question", postQuestion);

export default rootRouter;
