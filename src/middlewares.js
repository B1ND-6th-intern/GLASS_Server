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
      if (error.name === "TokenExpiredError") {
        return res.status(419).json({
          status: 419,
          error: "토큰이 만료되었습니다. 다시 로그인해주세요.",
        });
      } else if (error) {
        return res.status(401).json({
          status: 401,
          error: "유효하지 않은 토큰입니다.",
        });
      }
    } else {
      req.user = user;
      next();
    }
  });
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
});

export const imgsUpload = multer({
  dest: "uploads/imgs/",
});
