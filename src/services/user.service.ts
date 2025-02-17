import Token from "../models/token";
import User from "../models/user";

async function getUser(id: number) {
  return User.findOne({ where: { id } });
}
interface NormalizeInput {
  id: string | number; 
  email: string;
}

function normalize({ id, email }: NormalizeInput) {
  // Тепер id та email мають типи, помилки компіляції повинні зникнути
  return { id, email };
}

function findByEmail(email: string) {
  return User.findOne({ where: { email } });
}

const getUserToken = async (userId: number) => {
  return Token.findOne({ where: { userId } });
};

const userService = {
  normalize,
  findByEmail,
  getUser,
  getUserToken,
};

export default userService;
