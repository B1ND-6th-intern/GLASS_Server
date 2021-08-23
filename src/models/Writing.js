import mongoose from "mongoose";

const writingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  text: { type: String, required: true, trim: true, minLength: 1 },
  createdAt: { type: Date, required: true, default: Date.now },
  categories: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

writingSchema.static("formatCategories", (categories) => {
  return categories
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Writing = mongoose.model("Writing", writingSchema);

export default Writing;
