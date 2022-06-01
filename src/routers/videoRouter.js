import express from "express";
import {
  getEdit,
  watch,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
} from "../controllers/videoController";
import { protectMiddleware, upLoadVideo } from "../middlewares";
//================================================================

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectMiddleware)
  .get(getUpload)
  .post(
    upLoadVideo.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );
videoRouter.get("/:id", watch);
videoRouter
  .route("/:id/edit")
  .all(protectMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter.route("/:id/delete").all(protectMiddleware).get(deleteVideo);

export default videoRouter;
