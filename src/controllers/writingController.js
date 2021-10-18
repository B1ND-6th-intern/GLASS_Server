import Writing from "../models/Writing";
import User from "../models/User";
import Comment from "../models/Comment";
import Like from "../models/Like";

export const getPosts = async (req, res) => {
  const { _id } = req.user;
  const writings = await Writing.find({})
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    })
    .sort({ createdAt: "desc" });
  return res.status(200).json({
    status: 200,
    message: "메인 불러오기에 성공했습니다.",
    writings,
  });
};

export const getPopularPosts = async (req, res) => {
  const writings = await Writing.find({})
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    })
    .sort({ like: "desc" });
  return res.status(200).json({
    status: 200,
    message: "메인 불러오기에 성공했습니다.",
    writings,
  });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res.status(404).json({
      status: 404,
      message: "글을 찾을 수 없습니다.",
    });
  }
  return res.status(200).json({
    status: 200,
    message: "게시글을 찾았습니다.",
    writing,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const writing = await Writing.findById(id);
  if (!writing) {
    return res.status(404).json({
      status: 404,
      error: "글을 찾을 수 없습니다.",
    });
  }
  return res.status(200).json({
    status: 200,
    message: "편집할 게시글을 찾았습니다.",
    writing,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req;
  const { text, hashtag } = req.body;
  const writing = await Writing.exists({ _id: id });
  if (!writing) {
    return res.status(404).json({
      status: 404,
      error: "글을 찾을 수 없습니다.",
    });
  }
  if (String(writing.owner) !== String(_id)) {
    return res.status(403).json({
      status: 403,
      error: "권한이 없음",
    });
  }
  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({
      status: 404,
      error: "사용자를 찾을 수 없습니다.",
    });
  }
  try {
    user.writings.pull(id);
    user.save();
    const newWriting = await Writing.findByIdAndUpdate(
      id,
      {
        text,
        hashtag: Writing.formatHashtags(hashtag),
      },
      { new: true }
    );
    user.writings.push(newWriting._id);
    user.save();
    return res.status(200).json({
      status: 200,
      message: "게시글을 편집하였습니다.",
    });
  } catch (error) {
    console.log("postEdit", error);
    return res.stauts(400).json({
      status: 400,
      error: "게시글을 편집하지 못했습니다.",
    });
  }
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req;
  const { text, hashtags, imgs } = req.body;
  if (!imgs) {
    return res.status(400).json({
      status: 400,
      error: "사진을 첨부해주세요.",
    });
  }
  try {
    const newVideo = await Writing.create({
      text,
      owner: _id,
      hashtags,
      imgs,
    });
    const user = await User.findById(_id);
    await user.writings.push(newVideo._id);
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "업로드 성공!",
    });
  } catch (error) {
    console.log("postUpload", error);
    return res.status(400).json({
      status: 400,
      error: "업로드 실패",
    });
  }
};

export const postUploadImgs = (req, res) => {
  let urlArr = new Array();
  for (let i = 0; i < req.files.length; i++) {
    urlArr.push(`/imgs/${req.files[i].filename}`);
  }
  return res.status(200).json({
    status: 200,
    message: "이미지를 업로드했습니다.",
    jsonUrl: urlArr,
  });
};

export const deleteWriting = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req;
  const writing = await Writing.findById(id);
  if (!writing) {
    res.status(404).json({
      status: 404,
      error: "삭제할 게시물을 찾지 못함",
    });
  }
  if (String(writing.owner) !== String(_id)) {
    return res.status(403).json({
      status: 403,
      error: "권한이 없음",
    });
  }
  const user = await User.findById(_id);
  if (!user) {
    res.status(404).json({
      status: 404,
      error: "사용자를 찾지 못함",
    });
  }
  try {
    user.writings.pull(id);
    user.save();
    await Writing.findByIdAndDelete(id);
    return res.status(200).json({
      status: 200,
      message: "삭제 성공!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      error: "삭제 실패",
    });
  }
};

export const postUploadComment = async (req, res) => {
  const {
    user: { _id },
  } = req;
  const { text, writingId } = req.body;
  const writing = await Writing.findById(writingId);
  if (!writing) {
    return res.status(404).json({
      status: 404,
      error: "댓글을 달 게시물을 찾지 못했습니다.",
    });
  }
  try {
    const comment = await Comment.create({
      text,
      owner: _id,
      writing,
    });
    writing.comments.push(comment._id);
    writing.save();
    return res.status(200).json({
      status: 200,
      message: "댓글 작성 성공!",
    });
  } catch (error) {
    console.log("postComment", error);
    return res.status(400).json({
      status: 400,
      error: "댓글 작성 실패",
    });
  }
};

export const getEditComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    return res.status(404).json({
      status: 404,
      error: "댓글을 찾을 수 없습니다.",
    });
  }
  return res.status(200).json({
    status: 200,
    comment,
  });
};

export const postEditComment = async (req, res) => {
  const {
    user: { _id: userId },
  } = req;
  const { id } = req.params;
  const { text, writing } = req.body;
  const comment = await Comment.exists({ _id: id });
  if (!comment) {
    return res.status(404).json({
      status: 404,
      error: "글을 찾을 수 없습니다.",
    });
  }
  if (String(comment.owner) !== String(userId)) {
    return res.status(403).json({
      status: 403,
      error: "권한이 없음",
    });
  }
  try {
    writing.comments.pull(id);
    writing.save();
    const newComment = await Comment.findByIdAndUpdate(
      id,
      {
        text,
      },
      { new: true }
    );
    writing.comments.push(newComment._id);
    writing.save();
    return res.status(200).json({
      status: 200,
      message: "댓글 편집을 완료했습니다.",
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      error: "댓글을 편집하지 못했습니다.",
    });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req;
  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404).json({
      status: 404,
      error: "삭제할 댓글을 찾지 못함",
    });
  }
  if (String(comment.owner) !== String(_id)) {
    return res.status(403).json({
      status: 403,
      error: "권한이 없음",
    });
  }
  const writing = await Writing.findById(comment.writing);
  try {
    writing.comments.pull(id);
    writing.save();
    await Writing.findByIdAndDelete(id);
    return res.status(200).json({
      status: 200,
      message: "댓글 삭제 성공!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: 400,
      error: "댓글 삭제 실패",
    });
  }
};

export const registerWritingLike = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  const writing = await Writing.findById(id);
  try {
    if (writing === undefined) {
      res.status(404).json({
        status: 404,
        error: "좋아요를 표시할 게시글을 찾지 못했습니다.",
      });
    }
    const like = await Like.findOne({
      $and: [{ owner: _id }, { writing: id }],
    });
    if (like) {
      await Like.findByIdAndDelete(like);
      writing.likeCount--;
      await writing.save();
    } else {
      await Like.create({
        owner: _id,
        writing: id,
      });
      writing.likeCount++;
      await writing.save();
    }
    return res.status(200).json({
      status: 200,
      message: "좋아요 표시에 성공했습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 좋아요 등록/해제에 실패했습니다.",
    });
  }
};
