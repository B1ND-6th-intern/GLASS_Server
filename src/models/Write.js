import mongoose from "mongoose";

const writeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, required: true, default: Date.now },
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

const Write = mongoose.model("write", writeSchema);

export default Write;
