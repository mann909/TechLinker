import jwt from 'jsonwebtoken';

const generateAuthToken = (user = {}) => {
  return jwt.sign(user, process.env.AUTH_SECRET, {
    expiresIn: process.env.AUTH_EXPIRE,
  });
};

const generateRefreshToken = (user = {}) => {
  return jwt.sign(user, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

const generateTokens = (user = {}) => {
  const accessToken = generateAuthToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export default generateTokens;
global.generateTokens = generateTokens;
