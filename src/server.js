import express from "express";
import morgan from "morgan";
import session from "express-session";
import mongoStore from "connect-mongo";
import flash from "express-flash";

import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";

import { localMiddleware } from "./middlewares";

//===================================================================

const app = express();
const logger = morgan("dev");
app.use(logger);

// ==================================================================
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(flash());
app.use(localMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

// ==================================================================
export default app;
