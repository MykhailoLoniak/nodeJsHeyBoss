require("dotenv/config");

const jwtMod = require("jsonwebtoken");

function sign(user) {
  try {
    const token = jwtMod.sign(user, process.env.JWT_KEY, { expiresIn: "999s" });
    return token;
  } catch (err) {
    console.error("Error signing token:", err);
    return null; // Або можна кидати помилку
  }
}

function verify(token) {
  try {
    return jwtMod.verify(token, process.env.JWT_KEY);
  } catch (err) {
    return null;
  }
}

function signRefresh(user) {
  const token = jwtMod.sign(user, process.env.JWT_REFRESH_KEY);

  return token;
}

function verifyRefresh(token) {
  try {
    return jwtMod.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (err) {
    return null;
  }
}

// exports.sign = sign;
// exports.verify = verify;
// exports.signRefresh = signRefresh;
// exports.verifyRefresh = verifyRefresh;

const jwtService = {
  sign,
  verify,
  signRefresh,
  verifyRefresh,
};

module.exports = { jwtService };
