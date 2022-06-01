import videos from "../models/video";
import User from "../models/user";
import Comment from "../models/comment";
import { sendStatus } from "express/lib/response";

export const home = async (req, res) => {
  const video = await videos
    .find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", video });
};

export const watch = async (req, res) => {
  const id = req.params.id;
  const video = await videos
    .findById(id)
    .populate("owner")
    .populate("comments");

  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Not found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const id = req.params.id;
  const {
    user: { _id },
  } = req.session;
  const video = await videos.findById(id);
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const id = req.params.id;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashTags } = req.body;
  const video = await videos.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await videos.findByIdAndUpdate(id, {
    title,
    description,
    hashTags: videos.formatHashtags(hashTags),
  });

  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Video Upload" });
};

export const postUpload = async (req, res) => {
  const { _id } = req.session.user;
  const { video, thumb } = req.files;
  const { title, description, hashTags } = req.body;
  const isHeroku = process.env.NODE_ENV === "production";
  try {
    const newVideo = await videos.create({
      title,
      description,
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbUrl: isHeroku
        ? thumb[0].location.replace(/[\\]/g, "/")
        : thumb[0].path.replace(/[\\]/g, "/"),
      owner: _id,
      hashTags: videos.formatHashtags(hashTags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Video Upload",
      errorMsg: "비디오 생성에 실패하였습니다.",
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await videos.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Not found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await videos.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let video = [];
  if (keyword) {
    video = await videos.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  return res.render("search", { pageTitle: "검색", video });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await videos.findById(id);
  if (!video) {
    return res.sendStatus(404);
  } else {
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
  }
};

export const createComment = async (req, res) => {
  const {
    params: { id },
    body: { text },
    session: { user },
  } = req;

  const video = await videos.findById(id);
  if (!video) {
    return sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { commentId },
  } = req;

  const comment = await Comment.findById(commentId);
  if (String(_id) !== String(comment.owner._id)) {
    return res.sendStatus(404);
  }

  const videoId = comment.video;
  const video = await videos.findById(videoId);
  if (!video) {
    return res.sendStatus(404);
  }

  video.comments.splice(video.comments.indexOf(commentId), 1);
  await video.save();

  await Comment.findByIdAndRemove(commentId);

  return res.sendStatus(200);
};
