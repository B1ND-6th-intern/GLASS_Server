import "dotenv/config";
import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import writingRouter from "./routers/writingRouter";
import userRouter from "./routers/userRouter";
import commentRouter from "./routers/commentRouter";
import cors from "cors";

const app = express();
const logger = morgan("dev");

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/", rootRouter);
app.use("/writings", writingRouter);
app.use("/users", userRouter);
app.use("/comments", commentRouter);

export default app;
