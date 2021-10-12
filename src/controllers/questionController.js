import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Question from "../models/Question";

export const postquestion = async (req, res) => {
  const { name, email, title, type, getquestion } = req.body;
  try {
    getquestion = await Question.create({
      name,
      email,
      title,
      type,
      getquestion,
    });
    return res.status(200).json({
      status: 200,
      message: "문의사항 전달 성공",
    });
  } catch (error) {
    console.log(error);
    getquestion = null;
    return res.status(400).json({
      status: 400,
      error: "문의사항을 전달 실패",
    });
  }
};
