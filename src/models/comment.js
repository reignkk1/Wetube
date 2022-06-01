import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "video" },
});

const comment = mongoose.model("comment", commentSchema);
export default comment;
