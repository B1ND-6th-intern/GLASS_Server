import mongoose from "mongoose";

const authorizationSchema = new mongoose.Schema({
  failCount: { type: Number, default: 0, required: true },
  sendCount: { type: Number, default: 6, required: true },
  authUser: { type: mongoose.Types.ObjectId, ref: "User" },
});

const Authorization = mongoose.model("Authorizaion", authorizationSchema);

export default Authorization;
