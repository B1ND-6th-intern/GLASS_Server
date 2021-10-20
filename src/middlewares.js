import jwt from "jsonwebtoken";
import multer from "multer";

export const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token === undefined) {
    return res.status(400).json({
      status: 400,
      error: "토큰 포맷이 잘못 되었거나 토큰이 보내지지 않았습니다.",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) {
      console.log("토큰 에러 : " + error);
      return res.status(403).json({
        status: 403,
        error: "토큰 인증 과정에서 오류가 발생했습니다.",
      });
    }
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
