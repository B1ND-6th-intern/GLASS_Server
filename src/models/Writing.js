import mongoose from "mongoose";

const writingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  like: { type: Number, default: 0, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
});

writingSchema.static("formatHashtags", (hashtags) => {
  return hashtags.map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Writing = mongoose.model("Writing", writingSchema);

export default Writing;
