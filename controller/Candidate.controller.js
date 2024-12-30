import Candidate from '../model/Candidate.schema.js'
import buildResponse from '../utils/buildResponse.js';
import buildErrorObject from '../utils/buildErrorObject.js';
import handleError from '../utils/handleError.js';
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import generateTokens from '../utils/generateTokens.js';
import Profile from '../model/Profile.schema.js';
import {uploadToCloudinary}  from '../config/cloudinary.js'
import { matchedData } from 'express-validator';
import Verifications from '../model/Verifications.schema.js'

export const loginCandidate =async(req , res)=>{
    try{
        const {email , password}= matchedData(req) ;
      

        let candidate = await Candidate.findOne({email:email}).select('+password')

        if(!candidate){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'No Such User Found')
        }

        if(candidate.role!=='Candidate'){
            throw buildErrorObject(StatusCodes.UNAUTHORIZED , 'You are not authorized to login as candidate')
        }

        if(!await bcrypt.compare(password , candidate.password)){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Incorrect Password')
        }
        const user={
            id:candidate._id ,
            role:candidate.role
        }

        const {accessToken , refreshToken} = generateTokens(user)
        console.log(accessToken , refreshToken)
         candidate = await Candidate.findById(candidate._id).select('-password').lean()
        

        res
        .cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
        })
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
        })
        .status(StatusCodes.ACCEPTED)
        .json(buildResponse(StatusCodes.ACCEPTED, {candidate}))



    }catch(err){
        handleError(res ,err)

    }
}


export const registerCandidate = async(req, res) => {
    try {

        req=matchedData(req)
        const { fullName, email, mobile, password , otp} = req;

        const verification = await Verifications.findOne({
            email: req.email,
          }).lean()
          if (!verification) {
            throw buildErrorObject(
              StatusCodes.NOT_FOUND,
              'Verification record not found. Please request a new OTP.'
            )
          }
      
          if (parseInt(verification.otp) !== parseInt(otp)) {
            throw buildErrorObject(
                StatusCodes.BAD_REQUEST,
              'Invalid OTP. Please enter the correct OTP sent to your email.'
            )
          }

    
        const candidateExists = await Candidate.findOne({ email });
        if (candidateExists) {
            throw buildErrorObject(StatusCodes.CONFLICT, 'Candidate Already Exists')
        }

        const hashedPassword = await bcrypt.hash(password , 10)

        const newCandidate = new Candidate({ fullName, email, mobile, password:hashedPassword });
        await newCandidate.save();

        const newProfile = await Profile.create({
            userId: newCandidate._id, 
        });

        newCandidate.profile = newProfile._id;
        await newCandidate.save();

        // Send confirmation email
        // const emailTemplate = generateCandidateEmail(fullName, email, mobile);
        // await mailSender.sendEmail(email, "Candidate Registration Confirmation", emailTemplate);

        res
            .status(StatusCodes.CREATED)
            .json(buildResponse(StatusCodes.CREATED ,{message:'Candidate Registered'}))

    } catch (err) {
        handleError(res, err)
    }
}






export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const {
            subLocation,
            maritalStatus,
            dob,
            gender,
            language,
            englishFluency,
            currentAddress,
            permanentAddress,
            panCardNumber,
            drivingLicenseNumber,
            passPortNumber,
            workExperience,
            currentCompany,
            previousCompany,
            course,
            passingYear,
            marks,
            role,
            subRole,
            industry,
            jobType,
            prefferedLocation
        } = req.body;

        let panCardFileUrl = null;
        let drivingLicenseFileUrl = null;
        let passPortFileUrl = null;
        let resumeFileUrl = null;

        if (req.files?.panCardFile) {
            panCardFileUrl = await uploadToCloudinary(req.files.panCardFile[0].path, "documents");
        }
        if (req.files?.drivingLicenseFile) {
            drivingLicenseFileUrl = await uploadToCloudinary(req.files.drivingLicenseFile[0].path, "documents");
        }
        if (req.files?.passPortFile) {
            passPortFileUrl = await uploadToCloudinary(req.files.passPortFile[0].path, "documents");
        }
        if (req.files?.resumeFile) {
            resumeFileUrl = await uploadToCloudinary(req.files.resumeFile[0].path, "documents");
        }

        let languages = language ? language.split(',') : undefined;

        const profileData = {
            subLocation,
            maritalStatus,
            dob,
            gender,
            language: languages,
            englishFluency,
            currentAddress,
            permanentAddress,
            panCardNumber,
            panCardFile: panCardFileUrl,
            drivingLicenseNumber,
            drivingLicenseFile: drivingLicenseFileUrl,
            passPortNumber,
            passPortFile: passPortFileUrl,
            workExperience,
            resumeFile: resumeFileUrl,
            currentCompany,
            previousCompany,
            course,
            passingYear,
            marks,
            role,
            subRole,
            industry,
            jobType,
            prefferedLocation
        };

        const filteredProfileData = Object.fromEntries(
            Object.entries(profileData).filter(([_, value]) => value != null)
        );

        const updatedProfile = await Profile.findOneAndUpdate(
            { userId:id },
            filteredProfileData,
            { new: true } ,
            {upsert:true}
        );

        res
            .status(StatusCodes.OK)
            .json(buildResponse(StatusCodes.OK, {candidate:updatedProfile}));

    } catch (err) {
        console.log(err)
        handleError(res, err);
    }
}