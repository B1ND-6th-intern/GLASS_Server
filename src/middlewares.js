import jwt from "jsonwebtoken";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "GLASS";
  res.locals.loggedInUser = req.session.user;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  const searchtoken = req.headers["x-access-token"];
  if (searchtoken) {
    next();
  } else {
    res.status(400).json({
      //error: "go to login",
      error: "로그인 페이지으로 가십시오",
    });
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  const searchtoken = req.headers["x-access-token"];
  if (!searchtoken) {
    next();
  } else {
    res.status(400).json({
      //error: "go to home",
      error: "홈 페이지로 가십시오",
    });
  }
};

export const verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(419).json({
        status: 419,
        error: "토큰 만료",
      });
    }

    return res.status(401).json({
      status: 401,
      error: "토큰이 유효하지 않습니다.",
    });
  }
};
