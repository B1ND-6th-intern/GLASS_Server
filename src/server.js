import "dotenv/config";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import writingRouter from "./routers/writingRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import cors from "cors";

const app = express();
const logger = morgan("dev");

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);
app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/writing", writingRouter);
app.use("/user", userRouter);

export default app;
