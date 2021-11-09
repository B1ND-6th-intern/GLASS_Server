import User from "../models/User";
import Authorization from "../models/Authorization";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

let joinedUser;

export const getUserId = async (req, res) => {
  const { _id } = req.user;
  return res.status(200).json({
    status: 200,
    id: _id,
  });
};

export const postJoin = async (req, res) => {
  const pattern = /\s/g;
  const { password, password2, email, name, permission, isAgree } = req.body;
  const passwordRules =
    /^[a-zA-Z0-9!?@#$%^&*():;+-=~{}<>\_\[\]\|\\\"\'\,\.\/\`\₩]{6,15}$/;
  //const passwordRules = /^[a-zA-Z0-9]{6,15}$/;
  if (name.length > 10 && name.length < 3) {
    if (name.match(pattern)) {
      return res.status(400).json({
        status: 400,
        error: "이름을 공백을 제외한 2~10글자 이내로 작성해주세요.",
      });
    }
    return res.status(400).json({
      status: 400,
      error: "이름은 2~10글자 이내로 작성해주세요.",
    });
  }
  if (passwordRules.test(password) === false) {
    return res.status(400).json({
      status: 400,
      error: "숫자와 영문자 조합으로 6~15자리를 사용해야 합니다.",
    });
  }
  let grade, classNumber, stuNumber;
  if (isAgree === false) {
    return res.status(400).json({
      status: 400,
      error: "개인정보 수집에 동의해주세요.",
      // Please agree to the collection of personal information.
    });
  }
  if (permission < -1 || permission > 2) {
    return res.status(400).json({
      status: 400,
      error: "permission 값이 옳지 않습니다.",
    });
  }
  if (permission == 0) {
    grade = req.body.grade;
    classNumber = req.body.classNumber;
    stuNumber = req.body.stuNumber;
  } else {
    grade = 0;
    classNumber = 0;
    stuNumber = 0;
  }
  if (password !== password2) {
    return res.status(400).json({
      status: 400,
      error: "비밀번호가 일치하지 않습니다.",
      // Password is different
    });
  }
  try {
    const exists = await User.exists({ email: email });
    if (exists !== false) {
      return res.status(400).json({
        status: 400,
        error: "이 email은 이미 사용되고 있습니다. 다른 email로 바꿔주세요.",
        // This email is already in use, Please change to another email.
      });
    }
    joinedUser = await User.create({
      email,
      password,
      name,
      grade,
      classNumber,
      stuNumber,
      permission,
    });
    await Authorization.create({
      failCount: 0,
      sendCount: 6,
      authUser: joinedUser._id,
    });
    return res.status(200).json({
      status: 200,
      message: "회원가입 성공. 이메일의 인증번호를 확인해 주세요.",
      // succeeded register!
    });
  } catch (error) {
    console.log(error);
    joinedUser = null;
    return res.status(500).json({
      status: 500,
      error: "회원가입에 실패하였습니다. 다시 시도해주십시오.",
      // Registration failed, Please try again.
    });
  }
};

export const getEmailAuthorization = async (req, res) => {
  if (joinedUser === undefined) {
    return res.status(400).json({
      status: 400,
      error: "회원가입을 다시 해 주세요",
    });
  }
  if (joinedUser === null || joinedUser.isValid === true) {
    return res.status(400).json({
      status: 400,
      error: "이미 인증된 계정이거나 비정상적인 접근입니다.",
      // It is an already authenticated account or abnormal access.
    });
  }
  const authorization = await Authorization.findOne({
    authUser: joinedUser._id,
  });

  authorization.sendCount--;
  authorization.save();

  if (authorization.sendCount < 0) {
    const sendCount = authorization.sendCount;
    await Authorization.findByIdAndDelete(authorization._id);
    await User.findByIdAndDelete(joinedUser._id);
    joinedUser = null;
    return res.status(400).json({
      sendCount: sendCount,
      status: 400,
      error:
        "이미 이메일 인증 번호를 5번 전송했습니다. 다시 회원가입 해주세요.",
      // The email verification number is incorrect 5 times. You have to sign up again.
    });
  }

  const sendName = "glassfromb1nd@gmail.com";
  const password = process.env.EMAIL_PASSWORD;
  const confirmationCode = Math.floor(Math.random() * 8999) + 1000;
  const MailerConfilm = false;
  joinedUser.MailerConfilm = MailerConfilm;
  joinedUser.confirmationCode = confirmationCode;

  const transporter = nodemailer.createTransport({
    secure: false,
    service: "Gmail",
    auth: {
      user: sendName,
      pass: password,
    },
  });

  const mailOptions = {
    from: "glassfromb1nd@gmail.com",
    to: joinedUser.email,
    subject: "GLASS 회원가입 인증번호",
    text: `
안녕하세요 :) 저희 GLASS를 이용해주셔서 감사합니다.
회원가입을 위해 확인 코드를 입력창에 입력해주세요.

확인 코드: ${confirmationCode}

만약 인증이 되지 않는다면 인증 메일 재전송을 누르시거나 glassfromb1nd@gmail.com으로 문의해주시기 바랍니다.

- B1ND GLASS 팀 -`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      authorization.sendCount++;
      authorization.save();
      console.log(error);

      return res.status(500).json({
        status: 500,
        error: "메일 발송에 실패하였습니다.",
        // Failed to send mail.
      });
    }
  });
  joinedUser.MailerConfilm = true;
  return res.status(200).json({
    sendCount: authorization.sendCount,
    status: 200,
    message: `메일 발송에 성공하였습니다. 메일 재발송 기회가 ${authorization.sendCount}번 남았습니다.`,
    // Succeeded to send mail.
  });
};

export const postEmailAuthorization = async (req, res) => {
  const { timeover } = req.body;
  if (timeover === true) {
    joinedUser.confirmationCode = null;
    return res.status(400).json({
      status: 400,
      error:
        "인증시간을 초과했습니다. '재전송'을 눌러 다시 인증해주시기 바랍니다.",
    });
  }
  if (joinedUser.isValid === undefined) {
    joinedUser.isValid = false;
  }
  if (joinedUser === null || joinedUser.isValid === true) {
    return res.status(400).json({
      status: 400,
      error: "이미 인증된 계정이거나 비정상적인 접근입니다.",
      // It is an already authenticated account or abnormal access.
    });
  }
  if (!joinedUser.confirmationCode && joinedUser.MailerConfilm === false) {
    return res.status(400).json({
      status: 400,
      error:
        "이전에 메일이 발송되지 않았습니다. 메일 발송을 다시 시도해주세요.",
      // It is an already authenticated account or abnormal access.
    });
  }

  const authorization = await Authorization.findOne({
    authUser: joinedUser._id,
  });
  if (authorization.failCount >= 5) {
    const failedCount = authorization.failCount;
    await Authorization.findByIdAndDelete(authorization._id);
    await User.findByIdAndDelete(joinedUser._id);
    return res.status(400).json({
      failedCount: failedCount,
      status: 400,
      error: "이메일 인증 번호가 5번 틀렸습니다. 다시 회원가입 해주세요.",
      // The email verification number is incorrect 5 times. You have to sign up again.
    });
  }

  const {
    body: { confirmation },
  } = req;
  if (Number(joinedUser.confirmationCode) !== Number(confirmation)) {
    authorization.failCount += 1;
    console.log(authorization.failCount);
    authorization.save();
    return res.status(400).json({
      failedCount: authorization.failCount,
      status: 400,
      error: `이메일 인증 번호가 옳지 않습니다. 재인증 기회가 ${
        5 - authorization.failCount
      }번 남았습니다. 다시 입력해주세요.`,
      // The email verification number is incorrect. Please re-enter.
    });
  }

  joinedUser.isValid = true;
  joinedUser.save();
  joinedUser = null;
  return res.status(200).json({
    status: 200,
    message: "Email인증 성공!",
    // Email Verification Success!
  });
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(400).json({
        status: 400,
        error: "이 Email을 가진 계정이 존재하지 않습니다.",
        // An account with this email does not exist.
      });
    }
    if (!user.isValid) {
      return res.status(400).json({
        status: 400,
        error: "Email 인증이 되지 않았습니다.",
        // Email is not verified.
      });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (ok === false) {
      return res.status(400).json({
        status: 400,
        error: "비밀번호가 옳지 않습니다.",
        // The password is incorrect.
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "glass",
      }
    );
    return res.status(200).json({
      status: 200,
      message: "로그인 성공!",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "로그인 실패",
    });
  }
};

export const postEdit = async (req, res) => {
  const pattern = /\s/g;
  const {
    user: { _id },
    body: { name, introduction },
  } = req;
  if (name.length > 10 && name.length < 3) {
    if (name.match(pattern)) {
      return res.status(400).json({
        status: 400,
        error: "이름을 공백을 제외한 2~10글자 이내로 작성해주세요.",
      });
    }
    return res.status(400).json({
      status: 400,
      error: "이름은 2~10글자 이내로 작성해주세요.",
    });
  }
  if (introduction.length > 30) {
    return res.status(400).json({
      status: 400,
      error: "소개글은 30글자 이내로 작성해주세요.",
    });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name,
        introduction,
      },
      { new: true }
    );
    req.user = updatedUser;
    return res.status(200).json({
      status: 200,
      message: "회원정보 수정을 성공했습니다.",
      name,
      introduction,
      // Member information modification successful!
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 회원정보 수정에 실패했습니다.",
    });
  }
};

export const postEditAvatar = async (req, res) => {
  const {
    user: { _id },
    file: { filename },
  } = req;
  try {
    const user = await User.findById(_id);
    user.avatar = `/avatars/${filename}`;
    await user.save();
    const newavatar = filename;
    return res.status(200).json({
      status: 200,
      message: "회원 프로필 사진 수정 성공",
      newavatar: `/avatars/${newavatar}`,
      // Member avatar modification successful!
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: `회원 프로필 사진 수정 실패했습니다.`,
      // Member avatar modification failed!
    });
  }
};

export const postChangePassword = async (req, res) => {
  const {
    user: { _id },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).json({
      status: 400,
      error: "현재 비밀번호가 옳지 않습니다.",
      // The current password is incorrect.
    });
  }
  const passwordRules =
    /^[a-zA-Z0-9!?@#$%^&*():;+-=~{}<>\_\[\]\|\\\"\'\,\.\/\`\₩]{6,15}$/;
  if (!passwordRules.test(newPassword)) {
    return res.status(400).json({
      status: 400,
      error: "숫자와 영문자 조합으로 6~15자리를 사용해야 합니다.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).json({
      status: 400,
      error: "새로운 비밀번호가 일치하지 않습니다.",
      // The new passwords do not match.
    });
  }
  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    status: 200,
    message: "비밀번호 변경 성공",
    // Succeed changed password
  });
};

export const see = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("writings");
    if (user === undefined) {
      return res.status(404).json({
        status: 404,
        error: "유저를 찾지 못했습니다.",
        // User not found
      });
    }
    return res.status(200).json({
      status: 200,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: "서버 오류로 인해 유저 찾기에 실패했습니다.",
    });
  }
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let users = [];
  if (keyword !== undefined) {
    users = await User.find({
      name: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  return res.status(200).json({
    status: 200,
    users,
  });
};
