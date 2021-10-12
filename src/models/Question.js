import bcrypt from "bcrypt";
import mongoose from "mongoose";

const qestionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  getquestion: { type: mongoose.Types.ObjectId, ref: "getquestion" },
});

const Question = mongoose.model("Question", qestionSchema);

export default Question;
