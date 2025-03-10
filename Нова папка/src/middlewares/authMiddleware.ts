// // middlewares/authMiddleware.js
const { jwtService: jwtServicess } = require("../services/jwtService");

/** @typedef {import("express").Request} Request */
/** @typedef {import("express").Response} Response */
/** @typedef {import("express").NextFunction} NextFunction */

const authMiddleware = (req, res, next) => {
  const authorization = req.headers["authorization"] || "";
  const [, token] = authorization.split(" ");

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  const userData = jwtServicess.verify(token);

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};

module.exports = {
  authMiddleware,
};

// const jwt = require("jsonwebtoken");
// const { User: Users } = require("../models/user");

// const authMiddleware = (roles = []) => {
//   return async (req, res, next) => {
//     try {
//       console.log();
//       const token = req.headers.authorization.split(" ")[1]; // Bearer token
//       if (!token) {
//         return res.status(403).json({ message: "No token provided" });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_KEY);
//       console.log("Decoded token-------------------------:", decoded);
//       const user = await Users.findById(decoded.id);
//       console.log(
//         "User role--------------------------------------------:",
//         user
//       );

//       if (!user || (roles.length && !roles.includes(user.role))) {
//         return res.status(403).json({ message: "Forbidden" });
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//   };
// };

// module.exports = { authMiddleware };
