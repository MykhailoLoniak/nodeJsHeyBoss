// // middlewares/authMiddleware.js
const { jwtService } = require("../services/jwtService");

const authMiddleware = (req, res, next) => {
  const authorization = req.headers["authorization"] || "";
  const [, token] = authorization.split(" ");

  console.log("_____________________________________________:", authorization);
  console.log("+++++++++++++++++++++++++++++++++++++++++++++:", token);


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
