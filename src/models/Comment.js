import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  writing: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "writing",
  },
  createdAt: { type: Date, required: true, default: Date.now },
  like: { type: Number, default: 0, required: true },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
