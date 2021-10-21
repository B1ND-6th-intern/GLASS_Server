import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  writing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Writing",
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

const Like = mongoose.model("Like", likeSchema);

export default Like;
