const { jwtService } = require("../services/jwtService");

const authMiddleware = (req, res, next) => {
  const authorization = req.headers["authorization"] || "";
  const [, token] = authorization.split(" ");

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtService.verify(іtoken);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

module.exports = {
  authMiddleware,
};
