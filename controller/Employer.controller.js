import { StatusCodes } from 'http-status-codes';
import Employer from '../model/Employer.schema.js';
import buildErrorObject from '../utils/buildErrorObject.js';
import handleError from '../utils/handleError.js';
import bcrypt from 'bcrypt';
import buildResponse from '../utils/buildResponse.js';
import Verifications from '../model/Verifications.schema.js';
import { matchedData } from 'express-validator';
import generateTokens from '../utils/generateTokens.js';
import Applications from '../model/Applications.schema.js';

export const registerEmployer = async (req, res) => {
  try {
    req = matchedData(req);

    const {
      orgName,
      city,
      state,
      mobile,
      website,
      about,
      email,
      password,
      otp,
    } = req;

    const existingOrganisation = await Employer.findOne({
      $or: [{ website: website }, { mobile: mobile }],
    });


    if (existingOrganisation) {
      throw buildErrorObject(
        StatusCodes.CONFLICT,
        'Website or Mobile Number has been already used'
      );
    }
    console.log(email);

    const verification = await Verifications.findOne({
      email: req.email,
    }).lean();
    if (!verification) {
      throw buildErrorObject(
        StatusCodes.NOT_FOUND,
        'Verification record not found. Please request a new OTP.'
      );
    }

    if (parseInt(verification.otp) !== parseInt(otp)) {
      throw buildErrorObject(
        StatusCodes.BAD_REQUEST,
        'Invalid OTP. Please enter the correct OTP sent to your email.'
      );
    }

   
    if (
      !orgName ||
      !city ||
      !state ||
      !mobile ||
      !website ||
      !about ||
      !email ||
      !password
    ) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'Missing Parameters');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployer = await Employer.create({
      orgName,
      city,
      state,
      mobile,
      website,
      about,
      email,
      password: hashedPassword,
    });

    const employer = {
      orgName: newEmployer.orgName,
      city: newEmployer.city,
      state: newEmployer.state,
      mobile: newEmployer.mobile,
      website: newEmployer.website,
      about: newEmployer.about,
      email: newEmployer.email,
      isApproved: false,
    };

    res
      .status(StatusCodes.CREATED)
      .json(buildResponse(StatusCodes.CREATED, { employer }));
  } catch (err) {
    handleError(res, err);
  }
};

export const loginEmployer = async (req, res) => {
  try {
    req = matchedData(req);
    const { email, password } = req;
    if (!email || !password) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'Missing Parameters');
    }

    let employer = await Employer.findOne({ email: email }).select('+password');

    if (!employer) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'No Such Employer Found');
    }

    if (employer.role !== 'Employer') {
      throw buildErrorObject(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to login as employer'
      );
    }

    if (!(await bcrypt.compare(password, employer.password))) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'Incorrect Password');
    }
    const user = {
      id: employer._id,
      role: employer.role,
    };

    const { accessToken, refreshToken } = generateTokens(user);
    console.log(accessToken, refreshToken);
    employer = await Employer.findById(employer._id).select('-password').lean();

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
      .json(buildResponse(StatusCodes.ACCEPTED, employer));
  } catch (err) {
    handleError(res, err);
  }
};

export const getEmployerProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const employer = await Employer.findById(id).lean();

    if (!employer) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'No Such Employer Found');
    }

    res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK, employer));
  } catch (err) {
    handleError(res, err);
  }
};

export const updateEmployerProfile = async (req, res) => {
  try {
    const { id } = req.user;

    req = matchedData(req);

    await Employer.findByIdAndUpdate(id, req);

    res
      .status(StatusCodes.NO_CONTENT)
      .json(buildResponse(StatusCodes.NO_CONTENT));
  } catch (err) {
    handleError(res, err);
  }
};






export const getApplicationsDetails = async(req , res)=>{
  try{

    const aggregation = [

     { $match:{
        employerId: req.user.id
      },
    } ,
    {
      $group:{
        _id: "$jobId",
        count: { $sum: 1 }
      }
    } ,
    {
      $lookup:{
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job"
      }
    },

    {
      $unwind: "$job"
    },
    {
      $project:{
        jobName: "$job.post",
        count: 1
      }
    }
  
    ]

    const applications = await Applications.aggregate(aggregation);

    res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK,applications));




  }catch(err){
    handleError(res,err);
  }
}