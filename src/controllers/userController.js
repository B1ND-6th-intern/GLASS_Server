import User from "../models/User";
import Authorization from "../models/Authorization";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

let joinedUser = null;

export const postJoin = async (req, res) => {
  const {
    password,
    password2,
    grade,
    classNumber,
    stuNumber,
    email,
    name,
    isAgree,
  } = req.body;
  if (isAgree === false) {
    return res.status(400).json({
      status: 400,
      error: "개인정보 수집에 동의해주세요.",
      // Please agree to the collection of personal information.
    });
  }
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).json({
      status: 400,
      error: "비밀번호가 일치하지 않습니다.",
      // Password is different
    });
  }
  const exists = await User.exists({ email: email });
  if (exists) {
    return res.status(400).json({
      status: 400,
      error: "이 email은 이미 사용되고 있습니다. 다른 email로 바꿔주세요.",
      // This email is already in use, Please change to another email.
    });
  }
  try {
    joinedUser = await User.create({
      email,
      password,
      name,
      grade,
      classNumber,
      stuNumber,
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
    return res.status(400).json({
      status: 400,
      error: "회원가입에 실패하였습니다. 다시 시도해주십시오.",
      // Registration failed, Please try again.
    });
  }
};

export const getEmailAuthorization = async (req, res) => {
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

  authorization.sendCount -= 1;
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
  const recName = joinedUser.email;
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
    to: recName,
    subject: "GLASS 회원가입 인증번호",
    text: `
안녕하세요 :) 저희 GLASS를 이용해주셔서 감사합니다.
회원가입을 위해 확인 코드를 웹 페이지에 입력해주세요.

확인 코드: ${confirmationCode}

만약 인증이 되지 않는다면 인증 메일 재전송을 누르시거나 glassfromb1nd@gmail.com으로 문의해주시기 바랍니다.

- B1ND GLASS 팀 -`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      authorization.sendCount += 1;
      authorization.save();
      console.log(error);

      return res.status(400).json({
        status: 400,
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
  if (authorization.failCount >= 4) {
    const failedCount = authorization.failCount;
    await Authorization.findByIdAndDelete(authorization._id);
    await User.findByIdAndDelete(joinedUser._id);
    joinedUser = null;
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
  const pageTitle = "Login";
  const user = await User.findOne({ email });
  if (!user.isValid)
    return res.status(400).json({
      status: 400,
      error: "Email 인증이 되지 않았습니다.",
      // Email is not verified.
    });
  if (!user) {
    return res.status(400).json({
      status: 400,
      error: "이 Email을 가진 계정이 존재하지 않습니다.",
      // An account with this email does not exist.
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({
      status: 400,
      error: "비밀번호가 옳지 않습니다.",
      // The password is incorrect.
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;

  if (req.session.loggedIn) {
    const user = User.findOne({ where: { email: email } });
    const token = jwt.sign(
      {
        email: user.email,
        password: user.password,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // 유효기간 15분 => 15분 이후 토큰이 재발급 됨
        issuer: "nodebird",
      }
    );

    return res.status(200).json({
      status: 200,
      message: "로그인 성공!",
      token, // 발행된 jwt 토큰
    });
  } else {
    return res.status(404).json({
      status: 404,
      message: "사용자 데이터가 유효하지 않습니다.",
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.status(200).json({
    status: 200,
    message: "로그아웃 성공!",
    // Succeed log-out!
  });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email },
    file,
  } = req;
  const findEmail = await User.findOne({ email });
  if (findEmail !== null) {
    if (findEmail._id.toString() !== _id) {
      return res.status(400).json({
        status: 400,
        error: "이 email은 이미 존재합니다.",
        // This email already exists.
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.status(200).json({
    status: 200,
    message: "회원정보 수정 성공",
    // Member information modification successful!
  });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
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
  const user = await User.findById(id).populate("writings");
  if (!user) {
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
};
