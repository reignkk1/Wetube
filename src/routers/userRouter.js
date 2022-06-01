import express from "express";
import {
  remove,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
  getChangePwd,
  postChangePwd,
} from "../controllers/userController";
import {
  upLoadAvatar,
  protectMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";
//================================================================

const userRouter = express.Router();

userRouter.get("/logout", protectMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectMiddleware)
  .get(getEdit)
  .post(upLoadAvatar.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectMiddleware)
  .get(getChangePwd)
  .post(postChangePwd);
userRouter.get("/delete", remove);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see);
export default userRouter;
