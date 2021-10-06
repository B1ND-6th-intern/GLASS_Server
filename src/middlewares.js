import jwt from "jsonwebtoken";
import multer from "multer";

export const authenticateAccessToken = (req, res, next) => {
  console.log("I'm in authentication");
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ");
  console.log(token);
  if (!token[1]) {
    return res.status(400).json({
      status: 400,
      error: "토큰 포맷이 잘못 되었거나 토큰이 보내지지 않았습니다.",
    });
  }
  jwt.verify(token[1], process.env.JWT_SECRET, (error, user) => {
    if (error) {
      console.log("토큰 에러 : " + error);
      return res.status(403).json({
        status: 403,
        error: "토큰 인증 과정에서 오류가 발생했습니다.",
      });
    }
    console.log(user);
    req.user = user;
    next();
  });
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
});

export const imgsUpload = multer({
  dest: "uploads/imgs/",
});
