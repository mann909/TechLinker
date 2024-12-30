import buildResponse from '../utils/buildResponse.js';
import buildErrorObject from '../utils/buildErrorObject.js';
import { StatusCodes } from 'http-status-codes'
import otpGenerator  from 'otp-generator';
import { matchedData } from 'express-validator';
import sendMail from '../helpers/sendMail.js';
import Verifications from '../model/Verifications.schema.js'






export const sendOtp = async(req , res)=>{
    try{
        const {email} = matchedData(req)

        if(!email){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Email Is Required')
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
            { email:email},
            { otp, validTill },
            { upsert: true, new: true } 
          );
         

          res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK , 'OTP Sent Successfully'))



    }catch(err){
      buildErrorObject(res , err)

    }
}


