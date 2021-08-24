import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"

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
  if(password){
    return res.render("src/nodemailer/join",)
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

export const getEmailAuthorization = (req, res) => {
  return res.render("users/email-auth", { pageTitle: "Email Authorization" });
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

export const getEmailAuthorization = (req, res) => {
  const send_name = "junho07140714"
  const password = "qgfmrljkgqxjjrnh"
  const rec_name = req.session.user.email

  const cert_number = Math.floor(Math.random() * 8999) + 1000

  let transporter = nodemailer.createTransport({
    //host: 'smtp.mailtrap.io',
    //port: 2525,
    //secure: false, // secure:true for port 465, secure:false for port 587
    service: 'Gmail',
    auth: {
        user: send_name,
        pass: password
    }
  });

  const mailOptions = {
      from: 'opso@gmail.com', // sender address
      to: rec_name, // list of receivers`
      subject: 'OPSO 인증번호', // Subject line
      text: `안녕하세요!
  귀하의 장치를 인식하지 못했기 때문에 추가 확인이 필요한 서명입니다. 로그인을 완료하려면 인식할 수 없는 장치에서 확인 코드를 입력합니다.
      
  확인 코드: ${cert_number}

  계정에 로그인하려고 시도하지 않으면 암호가 손상될 수 있습니다. https://OPSO.com/settings/security을 방문하여 OPSO 계정에 사용할 강력한 새 암호를 만드십시오.
  감사합니다.

  OPSO 서버 팀`, // plain text body
      //html: '<b>Hello world ?</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

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
