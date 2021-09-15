import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  grade: { type: Number, required: true },
  classNumber: { type: Number, required: true },
  stuNumber: { type: Number, required: true },
  isValid: { type: Boolean, default: false },
  writings: [{ type: mongoose.Types.ObjectId, ref: "Writing" }],
  comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
