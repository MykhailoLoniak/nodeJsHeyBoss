const { Token } = require("../models/token.js");
const { client } = require("../utils/db.js");
const { User } = require("../models/user.js");

async function save(userId, newToken) {
  // try {
  const user = await User.findByPk(userId);
  if (!user) {
    console.log("Користувач НЕ існує");
  }

  console.log("Користувач існує");

  try {
    const existingToken = await Token.findOne({ where: { user_id: userId } });

    if (!existingToken) {
      const createdToken = await Token.create({
        user_id: userId,
        refresh_token: newToken,
      });
      console.log("Токен створено", createdToken);
    } else {
      existingToken.refreshToken = newToken;
      await existingToken.save();
      console.log("Токен оновлено", existingToken);
    }
  } catch (err) {
    console.error("Помилка при створенні або оновленні токена:", err);
  }
}

function getByToken(refreshToken) {
  return Token.findOne({ where: { refreshToken } });
}

async function remove(userId) {
  return await Token.destroy({ where: { userId } });
}

exports.save = save;
exports.getByToken = getByToken;
exports.remove = remove;
