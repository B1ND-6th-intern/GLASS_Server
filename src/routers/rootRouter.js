import express from "express";
import { postJoin, postLogin } from "../controllers/userController";
//import { postJoin, getLogin, postLogin } from "../controllers/userController";
import { home, search } from "../controllers/writingController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(() => {})
  .post(postJoin);
rootRouter.route("/login");
rootRouter.all(publicOnlyMiddleware);
rootRouter.post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;
