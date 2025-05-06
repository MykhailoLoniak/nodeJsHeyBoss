const { Token } = require("../models/token.js");
const { client } = require("../utils/db.js");
const { User } = require("../models/user.js");

async function save(userId, newToken) {
  // try {
  const user = await User.findByPk(userId);
  if (!user) {
  }

  try {
    const existingToken = await Token.findOne({ where: { user_id: userId } });

    if (!existingToken) {
      const createdToken = await Token.create({
        user_id: userId,
        refresh_token: newToken,
      });
    } else {
      existingToken.refresh_token = newToken;
      await existingToken.save();
    }
  } catch (err) {
    console.error("Помилка при створенні або оновленні токена:", err);
  }
}

function getByToken(refresh_token) {
  return Token.findOne({ where: { refresh_token } });
}

async function remove(userId) {
  return await Token.destroy({ where: { userId } });
}

exports.save = save;
exports.getByToken = getByToken;
exports.remove = remove;
