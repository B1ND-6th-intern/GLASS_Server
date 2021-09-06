import express from "express";
import { postJoin, postLogin } from "../controllers/userController";
import { home, search } from "../controllers/writingController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.post("/join", publicOnlyMiddleware, postJoin);
rootRouter.post("/login", publicOnlyMiddleware, postLogin);
rootRouter.get("/search", search);

export default rootRouter;
