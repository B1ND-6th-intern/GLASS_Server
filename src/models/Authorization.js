import mongoose from "mongoose";

const authorizationSchema = new mongoose.Schema({
  authCount: { type: Number, default: 0, required: true },
  authUser: { type: mongoose.Types.ObjectId, ref: "User" },
});

const Authorization = mongoose.model("Authorizaion", authorizationSchema);

export default Authorization;
