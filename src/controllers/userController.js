import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

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
      errorMessage: "개인정보 수집에 동의해주세요.^^",
    });
  }
  if (password) {
    return res.render("src/nodemailer/join");
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
    await User.create({
      email,
      username,
      password,
      name,
      grade,
      classNumber,
      stuNumber,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  return res.render("users/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "이 username을 가진 계정이 존재하지 않습니다.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
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
