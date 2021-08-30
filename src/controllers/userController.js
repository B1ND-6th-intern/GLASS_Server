import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

let joinedUser = {};

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const {
    username,
    password,
    password2,
    grade,
    classNumber,
    stuNumber,
    email,
    name,
    isAgree,
  } = req.body;
  if (!isAgree) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "개인정보 수집에 동의해주세요.",
    });
  }
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage:
        "이 username/email은 이미 사용되고 있습니다. 다른 username/email로 바꿔주세요.",
    });
  }
  try {
    joinedUser = await User.create({
      email,
      username,
      password,
      name,
      grade,
      classNumber,
      stuNumber,
    });
    return res.redirect("/user/email-auth");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getEmailAuthorization = (req, res) => {
  if (joinedUser === {} || joinedUser.isValid === true) {
    return res.redirect("/");
  }

  const sendName = "glassfromb1nd";
  const password = process.env.EMAIL_PASSWORD;
  const recName = joinedUser.email;
  //const confirmationCode = Math.floor(Math.random() * 8999) + 1000;
  const confirmationCode = 3000;
  joinedUser.confirmationCode = confirmationCode;

  const transporter = nodemailer.createTransport({
    sendmail: true,
    secure : false,
    service: "Gmail",
    auth: {
      user: sendName,
      pass: password,
    },
  });

  const mailOptions = {
    from: "glassfromb1nd@gmail.com",
    to: recName,
    subject: "OPSO 회원가입 인증번호",
    text: `안녕하세요!
    회원가입을 위해 확인 코드를 웹 페이지에 입력해주세요.
      
    확인 코드: ${confirmationCode}

    OPSO 서버 팀`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message %s sent: %s", info.messageId, info.response);
  });

  console.log(confirmationCode);

  return res.render("users/email-auth", { pageTitle: "Email Authorization" });
};

export const postEmailAuthorization = async (req, res) => {
  const {
    body: { confirmation },
  } = req;

  console.log(joinedUser.confirmationCode)
  console.log(confirmation)
  console.log(req)
  console.log(Number(joinedUser.confirmationCode) !== Number(confirmation))

  if (Number(joinedUser.confirmationCode) !== Number(confirmation)) {
    console.log(typeof joinedUser.confirmationCode, typeof confirmation);
    console.log(joinedUser.confirmationCode, confirmation);
    await User.findByIdAndDelete(joinedUser._id);
    joinedUser = {};
    
    console.log("이메일 인증 번호가 옳지 않습니다. 다시 입력해주세요.");
    return res.redirect("/join");
    // errorMessage: "이메일 인증 번호가 옳지 않습니다. 다시 입력해주세요."
  }

  joinedUser.isValid = true;
  joinedUser.save();
  return res.redirect("/login");
};

export const getLogin = (req, res) => {
  return res.render("users/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username });
  if(!user.isValid) return res.redirect('/user/email-auth');
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "이 username을 가진 계정이 존재하지 않습니다.",
    });
  }
  //const ok = await bcrypt.compare(password, user.password);
  if (String(password) !== String(user.password)) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "비밀번호가 옳지 않습니다.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, username, email },
    file,
  } = req;
  const findUsername = await User.findOne({ username });
  if (findUsername !== null) {
    if (findUsername._id.toString() !== _id) {
      return res.status(400).render("users/edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "이 username은 이미 존재합니다.",
      });
    }
  }
  const findEmail = await User.findOne({ email });
  if (findEmail !== null) {
    if (findEmail._id.toString() !== _id) {
      return res.status(400).render("users/edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "이 email은 이미 존재합니다.",
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/user/edit");
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", { pageTitle: "Change Password" });
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
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "현재 비밀번호가 옳지 않습니다.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "새로운 비밀번호가 일치하지 않습니다.",
    });
  }
  user.password = newPassword;
  await user.save();
  return res.redirect("/");
};

export const see = (req, res) => res.send("See User");
