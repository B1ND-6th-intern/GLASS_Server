import mongoose from "mongoose";

const writingSchema = new mongoose.Schema({
  text: { type: String, trim: true, maxLength: 65 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  likeCount: { type: Number, default: 0, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
  imgs: [{ type: String, required: true }],
  isLike: { type: Boolean, default: false },
  isOwner: { type: Boolean, default: false },
});

const Writing = mongoose.model("Writing", writingSchema);

export default Writing;
