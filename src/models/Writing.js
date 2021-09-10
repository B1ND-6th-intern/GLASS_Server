import mongoose from "mongoose";

const writingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  categories: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
  },
  like: { type: Number, default: 0, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
});

writingSchema.static("formatCategories", (categories) => {
  return categories
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Writing = mongoose.model("Writing", writingSchema);

export default Writing;
