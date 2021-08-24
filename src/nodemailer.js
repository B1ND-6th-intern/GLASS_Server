"use strict";
const nodemailer = require("nodemailer");
const send_name = "junho07140714";
const password = "qgfmrljkgqxjjrnh";
const rec_name = "junho07140714@dgsw.hs.kr";
const cert_number = Math.floor(Math.random() * 8999) + 1000;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: send_name,
    pass: password,
  },
});

// setup email data with unicode symbols
const mailOptions = {
  from: "opso@gmail.com", // sender address
  to: rec_name, // list of receivers`
  subject: "OPSO 인증번호", // Subject line
  text: `안녕하세요.
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
  console.log("Message %s sent: %s", info.messageId, info.response);
});
