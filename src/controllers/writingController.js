import Writing from "../models/Writing";
import User from "../models/User";
import Comment from "../models/Comment";
import Like from "../models/Like";
import fs from "fs";
import nodemailer from "nodemailer";

export const getPosts = async (req, res) => {
  try {
    const writings = await Writing.find({})
      .populate("owner")
      .populate({
        path: "comments",
        populate: {
          path: "owner",
        },
      })
      .sort({ _id: "desc" });
    return res.status(200).json({
      status: 200,
      message: "메인 불러오기에 성공했습니다.",
      writings,
    });
  } catch (error) {
    return res.status(500).json({
      stauts: 500,
      error: "서버 오류로 인해 게시글 조회에 실패했습니다",
    });
  }
};

export const getInfiniteScrollPosts = async (req, res) => {
  const { _id } = req.user;
  const { index } = req.params;
  try {
    const writings = await Writing.find({})
      .populate("owner")
      .populate({
        path: "comments",
        populate: {
          path: "owner",
        },
      })
      .sort({ _id: "desc" });
    if (writings[index] === undefined) {
      return res.status(200).json({
        status: 200,
        message: "무한 스크롤 끝에 다다랐습니다.",
      });
    }
    const writing = writings[index];
    const like = await Like.findOne({
      $and: [{ owner: _id }, { writing: writing._id }],
    });
    if (!like) {
      writing.isLike = false;
    } else {
      writing.isLike = true;
    }
    return res.status(200).json({
      status: 200,
      message: "메인 불러오기에 성공했습니다.",
      writing,
    });
  } catch (error) {
    return res.status(500).json({
      stauts: 500,
      error: "서버 오류로 인해 게시글 조회에 실패했습니다",
    });
  }
};

export const getPopularPosts = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 인기 게시글 조회에 실패했습니다.",
    });
  }
};

export const watch = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const writing = await Writing.findById(id);
    if (writing === undefined) {
      return res.status(404).json({
        status: 404,
        message: "글을 찾을 수 없습니다.",
      });
    }
    const like = await Like.findOne({
      $and: [{ owner: _id }, { writing: writing._id }],
    });
    if (!like) {
      writing.isLike = false;
    } else {
      writing.isLike = true;
    }
    return res.status(200).json({
      status: 200,
      message: "게시글을 찾았습니다.",
      writing,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 게시글 조회에 실패했습니다.",
    });
  }
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  try {
    const writing = await Writing.findById(id);
    if (writing === undefined) {
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
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 글 수정에 실패했습니다.",
    });
  }
};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
    params: { id },
  } = req;
  const { text, hashtag } = req.body;
  try {
    const writing = await Writing.exists({ _id: id });
    if (writing === undefined) {
      return res.status(404).json({
        status: 404,
        error: "글을 찾을 수 없습니다.",
      });
    }
    if (String(writing.owner) !== String(_id)) {
      return res.status(403).json({
        status: 403,
        error: "글을 수정할 권한이 없습니다.",
      });
    }
    const user = await User.findById(_id);
    if (user === undefined) {
      return res.status(404).json({
        status: 404,
        error: "사용자를 찾을 수 없습니다.",
      });
    }
    const newWriting = await Writing.findByIdAndUpdate(
      id,
      {
        text,
        hashtag: Writing.formatHashtags(hashtag),
      },
      { new: true }
    );
    user.writings = user.writings.filter((writingId) => writingId !== id);
    user.writings.push(newWriting._id);
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "게시글을 편집하였습니다.",
    });
  } catch (error) {
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
  console.log(imgs);
  if (imgs === null) {
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
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 업로드에 실패했습니다.",
    });
  }
};

export const postUploadImgs = (req, res) => {
  const urlArr = new Array();
  for (const file of req.files) {
    urlArr.push(`/imgs/${file.filename}`);
  }
  return res.status(200).json({
    status: 200,
    message: "이미지를 업로드했습니다.",
    jsonUrl: urlArr,
  });
};

export const deleteWriting = async (req, res) => {
  const {
    user: { _id },
    params: { id },
  } = req;
  try {
    const writing = await Writing.findById(id);
    if (writing === undefined) {
      return res.status(404).json({
        status: 404,
        error: "삭제할 게시물을 찾지 못했습니다.",
      });
    }
    if (String(writing.owner) !== String(_id)) {
      return res.status(403).json({
        status: 403,
        error: "글을 삭제할 권한이 없습니다.",
      });
    }
    const user = await User.findById(_id);
    if (user === undefined) {
      return res.status(404).json({
        status: 404,
        error: "사용자를 찾지 못했습니다.",
      });
    }
    user.writings = user.writings.filter((writingId) => writingId !== id);
    await user.save();
    for (img of writing.imgs) {
      fs.unlink(`../../uploads${writing.img}`, (err) => {
        if (err) throw err;
        return res.status(500).json({
          status: 500,
          error: "사진 파일 삭제에 실패했습니다.",
        });
      });
    }
    await Writing.findByIdAndDelete(id);
    return res.status(200).json({
      status: 200,
      message: "게시글 삭제에 성공했습니다.",
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      error: "게시글 삭제에 실패했습니다.",
    });
  }
};

export const postUploadComment = async (req, res) => {
  const {
    user: { _id },
  } = req;
  const { text, writingId } = req.body;
  if (text === undefined) {
    return res.status(400).json({
      status: 400,
      error: "댓글에 글을 작성해세요.",
    });
  }
  try {
    const writing = await Writing.findById(writingId);
    if (writing === undefined) {
      return res.status(404).json({
        status: 404,
        error: "댓글을 달 게시물을 찾지 못했습니다.",
      });
    }
    const comment = await Comment.create({
      text,
      owner: _id,
      writing,
    });
    writing.comments.push(comment._id);
    await writing.save();
    return res.status(200).json({
      status: 200,
      message: "댓글 작성 성공!",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 댓글 작성에 실패했습니다.",
    });
  }
};

export const getEditComment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id);
    if (comment === undefined) {
      return res.status(404).json({
        status: 404,
        error: "댓글을 찾을 수 없습니다.",
      });
    }
    return res.status(200).json({
      status: 200,
      comment,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 댓글을 찾지 못했습니다.",
    });
  }
};

export const postEditComment = async (req, res) => {
  const {
    user: { _id: userId },
  } = req;
  const { id } = req.params;
  const { text, writing } = req.body;
  const comment = await Comment.exists({ _id: id });
  if (comment === undefined) {
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
    return res.status(500).json({
      status: 500,
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
  if (comment === undefined) {
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

export const postQuestion = async (req, res) => {
  const { name, email, title, type, getquestion } = req.body;
  const sendName = "glassfromb1nd@gmail.com";
  const password = process.env.EMAIL_PASSWORD;
  const recName = email;

  const transporter = nodemailer.createTransport({
    secure: false,
    service: "Gmail",
    auth: {
      user: sendName,
      pass: password,
    },
  });

  const mailOptions = {
    from: sendName,
    to: recName,
    subject: "GLASS 문의사항 답변",
    text: `
          안녕하세요 :) 저희 GLASS를 이용해주셔서 감사합니다.
          문의주신 사항에 답변을 드리겠습니다.
  
          <Glass 팀의 답변>
  
          더 좋은 서비스를 위해 항상 노력하는 GLASS 팀이 되도록 하겠습니다.
          감사합니다 :)
  
          - B1ND GLASS 팀 -
          
          - 접수자 : ${name}
          - 이메일 : ${email}
          - 제목 : ${title}
          - 문의 종류 : ${type}
          - 문의 사항 : ${getquestion}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        error: "문의사항을 전달 실패",
      });
    }
  });
  return res.status(200).json({
    status: 200,
    message: "문의사항 전달 성공",
  });
};
