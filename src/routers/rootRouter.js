import express from "express";
import { postJoin, postLogin, search } from "../controllers/userController";
import {
  getInfiniteScrollPosts,
  getPosts,
} from "../controllers/writingController";

const rootRouter = express.Router();

rootRouter.get("/posts", getPosts);
rootRouter.get(
  "/posts/:index",
  authenticateAccessToken,
  getInfiniteScrollPosts
);
rootRouter.post("/join", postJoin);
rootRouter.post("/login", postLogin);
rootRouter.get("/search", search);

export default rootRouter;
