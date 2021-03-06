import Writing from "../models/Writing";
import User from "../models/User";
import Comment from "../models/Comment";
import Like from "../models/Like";
import fs from "fs";
import nodemailer from "nodemailer";

export const getPosts = async (req, res) => {
  const { _id } = req.user;
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
    for (const writing of writings) {
      const like = await Like.findOne({
        $and: [{ owner: _id }, { writing: writing._id }],
      });
      if (like) {
        writing.isLike = true;
      }
      if (String(writing.owner._id) === _id) {
        writing.isOwner = true;
      }
    }
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
    let writing = writings[index];
    const like = await Like.findOne({
      $and: [{ owner: _id }, { writing: writing._id }],
    });
    if (like) {
      writing.isLike = true;
    }
    if (String(writing.owner._id) === _id) {
      writing.isOwner = true;
    }
    for (const comment of writing.comments) {
      if (String(comment.owner._id) === _id) {
        comment.isOwner = true;
      }
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
      .sort({ likeCount: "desc" });
    return res.status(200).json({
      status: 200,
      message: "메인 불러오기에 성공했습니다.",
      writings: writings.slice(0, 3),
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
    const writing = await Writing.findById(id)
      .populate("owner")
      .populate({
        path: "comments",
        populate: {
          path: "owner",
        },
      });
    if (writing === null) {
      return res.status(404).json({
        status: 404,
        message: "글을 찾을 수 없습니다.",
      });
    }
    const like = await Like.findOne({
      $and: [{ owner: _id }, { writing: writing._id }],
    });
    if (like) {
      writing.isLike = true;
    }
    if (String(writing.owner._id) === _id) {
      writing.isOwner = true;
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
  if (text.length > 65) {
    return res.status(400).json({
      status: 400,
      error: "게시글 본문은 최대 65글자까지만 작성 가능합니다.",
    });
  }
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
    user.writings = user.writings.filter(
      (writingId) => String(writingId) !== id
    );
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
  if (imgs.length === 0) {
    return res.status(400).json({
      status: 400,
      error: "사진을 첨부해주세요.",
    });
  }
  if (text.length > 65) {
    return res.status(400).json({
      status: 400,
      error: "게시글 본문은 최대 65글자까지만 작성 가능합니다.",
    });
  }
  try {
    const newWriting = await Writing.create({
      text,
      owner: _id,
      hashtags,
      imgs,
    });
    const user = await User.findById(_id);
    if (user.permission == 1) {
      return res.status(400).json({
        status: 400,
        error: "아쉽지만 학부모님 계정으로는 게시글을 업로드할 수 없습니다.",
      });
    }
    await user.writings.push(newWriting._id);
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "업로드 성공!",
      newWriting,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 업로드에 실패했습니다.",
    });
  }
};

export const postUploadImgs = (req, res) => {
  try {
    const urlArr = new Array();
    for (const file of req.files) {
      urlArr.push(`/imgs/${file.filename}`);
    }
    return res.status(200).json({
      status: 200,
      message: "이미지를 업로드했습니다.",
      jsonUrl: urlArr,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 이미지 업로드에 실패했습니다.",
    });
  }
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
    user.writings = user.writings.filter(
      (writingId) => String(writingId) !== id
    );
    await user.save();
    for (const img of writing.imgs) {
      fs.unlink(`./uploads${img}`, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }
    await Writing.findByIdAndDelete(id);
    return res.status(200).json({
      status: 200,
      message: "게시글 삭제에 성공했습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 게시글 삭제에 실패했습니다.",
    });
  }
};

export const deleteOneImg = async (req, res) => {
  const { img } = req.body;
  try {
    fs.unlink(`./uploads${img}`, (error) => {
      if (error) {
        console.log(error);
      }
    });
    return res.status(200).json({
      status: 200,
      message: "사진 삭제에 성공했습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 이미지 삭제에 실패했습니다.",
    });
  }
};

export const postUploadComment = async (req, res) => {
  const {
    user: { _id },
  } = req;
  const { text, writingId } = req.body;
  if (!text) {
    return res.status(400).json({
      status: 400,
      error: "댓글에 글을 작성해세요.",
    });
  }
  if (text.length > 30) {
    return res.status(400).json({
      status: 400,
      error: "댓글은 최대 30글자까지만 작성 가능합니다.",
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
    const newComment = await Comment.create({
      text,
      owner: _id,
      writing,
    });
    writing.comments.push(newComment._id);
    await writing.save();
    const comment = await Comment.findById(newComment._id).populate("owner");
    return res.status(200).json({
      status: 200,
      message: "댓글 작성 성공!",
      comment,
    });
  } catch (error) {
    console.log(error);
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
    params: { id }, // comment의 id
  } = req;
  const { text, writing } = req.body;
  if (text.length > 30) {
    return res.status(400).json({
      status: 400,
      error: "댓글은 최대 30글자까지만 작성 가능합니다.",
    });
  }
  try {
    const comment = await Comment.findById(id);
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
    const writing = await Writing.findById(comment.writing);
    writing.comments = writing.comments.filter(
      (commentId) => String(commentId) !== id
    );
    await writing.save();
    const newComment = await Comment.findByIdAndUpdate(
      id,
      {
        text,
      },
      { new: true }
    );
    writing.comments.push(newComment._id);
    await writing.save();
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
  const {
    user: { _id },
    params: { id },
  } = req;
  try {
    const comment = await Comment.findById(id);
    if (comment === undefined) {
      res.status(404).json({
        status: 404,
        error: "삭제할 댓글을 찾지 못했습니다.",
      });
    }
    if (String(comment.owner) !== String(_id)) {
      return res.status(403).json({
        status: 403,
        error: "댓글을 삭제할 권한이 없습니다.",
      });
    }
    const writing = await Writing.findById(comment.writing);
    writing.comments = writing.comments.filter(
      (commentId) => String(commentId) !== id
    );
    await writing.save();
    await Comment.findByIdAndDelete(id);
    return res.status(200).json({
      status: 200,
      message: "댓글 삭제에 성공했습니다!",
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
      if (writing.likeCount < 0) {
        writing.likeCount = 0;
      }
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
  const { _id } = req.user;
  const { question } = req.body;
  try {
    const user = await User.findById(_id);
    const sendName = "glassfromb1nd@gmail.com";
    const password = process.env.EMAIL_PASSWORD;
    const recName = user.email;

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
          
          - 접수자 : ${user.name}
          - 이메일 : ${user.email}
          - 문의 사항 : ${question}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          status: 500,
          error: "문의사항 전달에 실패했습니다.",
        });
      }
    });
    return res.status(200).json({
      status: 200,
      message:
        "문의사항을 전달했습니다. 빠른 시일 내에 해당 계정의 이메일로 답변을 전송해드리겠습니다.",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 문의사항 전달에 실패했습니다.",
    });
  }
};
