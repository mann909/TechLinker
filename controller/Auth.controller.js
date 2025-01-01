import buildResponse from '../utils/buildResponse.js';
import buildErrorObject from '../utils/buildErrorObject.js';
import { StatusCodes } from 'http-status-codes';
import otpGenerator from 'otp-generator';
import { matchedData } from 'express-validator';
import sendMail from '../helpers/sendMail.js';
import Verifications from '../model/Verifications.schema.js';
import handleError from '../utils/handleError.js';
import jwt from 'jsonwebtoken';

export const sendOtp = async (req, res) => {
  try {
    const { email } = matchedData(req);

    if (!email) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'Email Is Required');
    }

    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    const validTill = new Date(Date.now() + 30 * 60000);

    sendMail(email, 'register.ejs', {
      subject: 'Your Verification OTP',
      otp,
    });

    await Verifications.findOneAndUpdate(
      { email: email },
      { otp, validTill },
      { upsert: true, new: true }
    );

    res
      .status(StatusCodes.OK)
      .json(buildResponse(StatusCodes.OK, 'OTP Sent Successfully'));
  } catch (err) {
    handleError(res, err);
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    console.log(req.cookies);

    if (!accessToken || !refreshToken) {
      throw buildErrorObject(StatusCodes.UNAUTHORIZED, 'Session Expired');
    }

    console.log(process.env.AUTH_SECRET);
    const decoded = jwt.verify(accessToken, process.env.AUTH_SECRET);

    const user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    res
      .status(StatusCodes.ACCEPTED)
      .json(buildResponse(StatusCodes.ACCEPTED, user));
  } catch (err) {
    console.log(err);
    handleError(res, err);
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie('accessToken', { httpOnly: true, secure: false });
    res.clearCookie('refreshToken', { httpOnly: true, secure: false });

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    handleError(res, err);
  }
};
