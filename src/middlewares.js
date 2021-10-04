import jwt from "jsonwebtoken";
import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "GLASS";
  res.locals.loggedInUser = req.session.user;
  next();
};

export const authenticateAccessToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("wrong token format or token is not sended");
    return res.sendStatus(400);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      console.log(error);
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 },
});

export const imgsUpload = multer({
  dest: "uploads/imgs/",
  limits: { fileSize: 10000000 },
});
