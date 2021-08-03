import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import writeRouter from "./routers/writeRouter";
import userRouter from "./routers/userRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "react");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use("/", globalRouter);
app.use("/write", writeRouter);
app.use("/user", userRouter);

export default app;
