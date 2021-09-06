import User from "../models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

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
  console.log(req.body);
  if (isAgree !== true) {
    return res.status(400).json({
      error: "Please agree to the collection of personal information.",
      //개인정보 수집에 동의해주세요.
    });
  }
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).json({
      error: "Password is different",
      //비밀번호가 일치하지 않습니다
    });
  }
  const exists = await User.exists({ email: email });
  if (exists) {
    return res.status(400).json({
      error: "This email is already in use, Please change to another email.",
      //이 email은 이미 사용되고 있습니다. 다른 email로 바꿔주세요.
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
    return res.status(200).json({
      message: "succeeded register!",
      //회원가입 성공
    });
  } catch (error) {
    return res.status(400).json({
      error: "Registration failed, Please try again.",
      //회원가입에 실패하였습니다. 다시 시도해주십시오.
    });
  }
};

export const getEmailAuthorization = (req, res) => {
  if (joinedUser === null || joinedUser.isValid === true) {
    res.status(400).json({
      error: "It is an already authenticated account or abnormal access.",
      //이미 인증된 계정이거나 비정상적인 접근입니다.
    });
  }
  const sendName = "glassfromb1nd@gmail.com";
  const password = process.env.EMAIL_PASSWORD;
  const recName = joinedUser.email;
  const confirmationCode = Math.floor(Math.random() * 8999) + 1000;
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
    text: `안녕하세요!
    회원가입을 위해 확인 코드를 웹 페이지에 입력해주세요.
      
    확인 코드: ${confirmationCode}

    GLASS 서버 팀`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(400).json({
        error: "Failed to send mail.",
        //메일 발송에 실패하였습니다.
      });
    }
    console.log("Message %s sent: %s", info.messageId, info.response);
  });
  return res.status(200).json({
    message: "Succeeded to send mail.",
    //
  });
};

export const postEmailAuthorization = async (req, res) => {
  const {
    body: { confirmation },
  } = req;

  if (Number(joinedUser.confirmationCode) !== Number(confirmation)) {
    await User.findByIdAndDelete(joinedUser._id);
    joinedUser = null;
    return res.status(400).json({
      error: "The email verification number is incorrect. Please re-enter.",
      //이메일 인증 번호가 옳지 않습니다. 다시 입력해주세요.
    });
  }

  joinedUser.isValid = true;
  joinedUser.save();
  return res.status(200).json({
    message: "Email Verification Success!",
    //Email인증 성공!
  });
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ email });
  if (!user.isValid)
    return res.status(400).json({
      error: "Email is not verified.",
      //Email 인증이 되지 않았습니다.
    });
  if (!user) {
    return res.status(400).json({
      error: "An account with this email does not exist.",
      //이 Email을 가진 계정이 존재하지 않습니다.
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).json({
      error: "The password is incorrect.",
      //비밀번호가 옳지 않습니다.
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.status(200).json({
    message: "Succeed log-in!",
    //로그인 성공!
  });
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.status(200).json({
    message: "Succeed log-out!",
    //로그아웃 성공!
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
        error: "This email already exists.",
        //이 email은 이미 존재합니다.
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
    message: "Member information modification successful!",
    //회원정보 수정 성공
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
      error: "The current password is incorrect.",
      //현재 비밀번호가 옳지 않습니다.
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).json({
      error: "The new passwords do not match.",
      //새로운 비밀번호가 일치하지 않습니다.
    });
  }
  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    message: "Succeed changed password",
    //비밀번호 변경 성공
  });
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("writings");
  if (!user) {
    return res.status(404).json({
      error: "User not found",
      //유저를 찾지 못했습니다.
    });
  }
  return res.status(200).json({
    user,
  });
};
