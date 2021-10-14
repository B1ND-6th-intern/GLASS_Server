import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  grade: { type: Number },
  classNumber: { type: Number },
  stuNumber: { type: Number },
  isValid: { type: Boolean, default: false },
  permission: { type: Number, required: true }, // 0 학생, 1 학부모, 2 교직원
  writings: [{ type: mongoose.Types.ObjectId, ref: "Writing" }],
  introduction: { type: String, default: "안녕하세요 :)" },
  avatar: { type: String },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
