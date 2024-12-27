import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import handleError from '../utils/handleError.js';
import buildErrorObject from '../utils/buildErrorObject.js';


const authMiddleware = (req, res, next) => {
  // Check for the token in headers or cookies
  const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    throw buildErrorObject(StatusCodes.UNAUTHORIZED, 'No token provided')
  }

  try {

    jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
      if (err) {
        console.log(err)
        throw buildErrorObject(StatusCodes.UNAUTHORIZED, 'Invalid Token')
      }

      console.log(decoded)


      
      req.user = decoded;
      next(); 
    });
  } catch (err) {
    handleError(res , err)
  }
}

export default authMiddleware;
