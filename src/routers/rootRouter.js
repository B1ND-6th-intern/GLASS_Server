import express from "express";
import { postJoin, postLogin, search } from "../controllers/userController";
import { home } from "../controllers/writingController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.post("/join", postJoin);
rootRouter.post("/login", postLogin);
rootRouter.get("/search", search);

export default rootRouter;
