import nodemailer from "nodemailer";

export const postquestion = async (req, res) => {
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
    from: "glassfromb1nd@gmail.com",
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
      getquestion = null;
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
