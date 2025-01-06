import Applications from '../model/Application.schema.js';
import Employer from '../model/Employer.schema.js';
import Jobs from '../model/Job.schema.js';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import buildErrorObject from '../utils/buildErrorObject.js';
import handleError from '../utils/handleError.js';
import buildResponse from '../utils/buildResponse.js';
import { matchedData } from 'express-validator';

export const createApplication = async (req, res) => {
  try {
    const { id } = req.user;
    req = matchedData(req);

    const { jobId } = req;

    const jobExists = await Jobs.findById(jobId);

    if (!jobExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(buildErrorObject(StatusCodes.NOT_FOUND, 'Job not found'));
    }

    const employerId = jobExists.organisation;

    const application = await Applications.findOneAndUpdate(
      { jobId, candidateId: id, employerId },
      { $setOnInsert: { jobId, candidateId: id, employerId } },
      { upsert: true, new: false }
    );

    if (application) {
      return res
        .status(StatusCodes.CONFLICT)
        .json(
          buildErrorObject(StatusCodes.CONFLICT, 'Application already exists')
        );
    }

    return res
      .status(StatusCodes.CREATED)
      .json(
        buildResponse(StatusCodes.CREATED, 'Application Created Successfully')
      );
  } catch (err) {
    console.log('Error while creating application : ', err);
    handleError(res, err);
  }
};

export const getApplicationsDetails = async (req, res) => {
  try {
    const employerId = req.user.id;
    req = matchedData(req);
    const page = parseInt(req?.page || 1); 
    const limit = parseInt(req?.limit || 4);
    const skip = (page - 1) * limit;
    const searchQuery = req?.search || '';
    console.log(searchQuery)

    // Step 1: Fetch all jobs for the employer with optional search query
    const employer = await Employer.findById(employerId).populate({
      path: 'jobs',
      match: searchQuery
        ? { post: { $regex: searchQuery, $options: 'i' } }
        : {},
    })

  

    if (!employer || !employer.jobs.length) {
      return res.status(StatusCodes.OK).json(
        buildResponse(StatusCodes.OK, {
          docs: [],
          totalDocs: 0,
          limit,
          totalPages: 0,
          page,
          pagingCounter: 0,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        })
      );
    }

    const jobIds = employer.jobs.map((job) => job._id);

    const countAggregation = [
      {
        $match: {
          jobId: { $in: jobIds },
        },
      },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 },
        },
      },
    ];

    const applicationsCount = await Applications.aggregate(countAggregation);

    const applicationsMap = applicationsCount.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});


    const jobsWithApplications = employer.jobs.map((job) => {
      return {
        job,
        count: applicationsMap[job._id.toString()] || 0,
      };
    });


    const totalDocs = jobsWithApplications.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginatedJobs = jobsWithApplications.slice(skip, skip + limit);

    const paginationData = {
      docs: paginatedJobs,
      totalDocs,
      limit,
      totalPages,
      page,
      pagingCounter: skip + 1,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
    };

  
    res
      .status(StatusCodes.OK)
      .json(buildResponse(StatusCodes.OK, paginationData));
  } catch (err) {
    console.error(err);
    handleError(res, err);
  }
};

export const getJobApplicantsDetails = async (req, res) => {
  try {
    const { id } = req.user;
    req = matchedData(req);
    const { jobId } = req;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(buildErrorObject(StatusCodes.BAD_REQUEST, 'Invalid URL')); // changed for user interface (URL = jobId)
    }

    const jobExists = await Jobs.findById(jobId);
    if (!jobExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(buildErrorObject(StatusCodes.NOT_FOUND, 'Job not found'));
    }

    if (jobExists.organisation.toString() !== id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(buildErrorObject(StatusCodes.FORBIDDEN, 'Access Denied'));
    }

    const aggregation = [
      {
      $match: {
        jobId: mongoose.Types.ObjectId.createFromHexString(jobId), // Match specific jobId
      },
      },
      {
      $lookup: {
        from: 'jobs', // Job collection
        localField: 'jobId',
        foreignField: '_id',
        as: 'job', // Embed matched job
      },
      },
      {
      $unwind: '$job', // Unwind to get a single job object
      },
      {
      $lookup: {
        from: 'candidates', // Candidate collection
        localField: 'candidateId',
        foreignField: '_id',
        as: 'candidates', // Embed matched candidates
      },
      },
      {
      $unwind: '$candidates', // Unwind to handle each candidate individually
      },
      {
      $lookup: {
        from: 'profiles', // Profile collection
        localField: 'candidates.profile', // Reference to the profile field
        foreignField: '_id',
        as: 'candidates.profile', // Populate profile field
      },
      },
      {
      $unwind: {
        path: '$candidates.profile',
        preserveNullAndEmptyArrays: true, // Keep candidates even if profile is missing
      },
      },
      {
      $group: {
        _id: '$job._id',
        job: { $first: '$job' },
        candidates: {
        $push: {
          _id: '$candidates._id',
          fullName: '$candidates.fullName',
          email: '$candidates.email',
          mobile: '$candidates.mobile',
          profile: {
          _id: '$candidates.profile._id',
          subLocation: '$candidates.profile.subLocation',
          maritalStatus: '$candidates.profile.maritalStatus',
          dob: '$candidates.profile.dob',
          gender: '$candidates.profile.gender',
          language: '$candidates.profile.language',
          englishFluency: '$candidates.profile.englishFluency',
          currentAddress: '$candidates.profile.currentAddress',
          permanentAddress: '$candidates.profile.permanentAddress',
          workExperience: '$candidates.profile.workExperience',
          resumeFile: '$candidates.profile.resumeFile',
          currentCompany: '$candidates.profile.currentCompany',
          previousCompany: '$candidates.profile.previousCompany',
          course: '$candidates.profile.course',
          passingYear: '$candidates.profile.passingYear',
          marks: '$candidates.profile.marks',
          role: '$candidates.profile.role',
          subRole: '$candidates.profile.subRole',
          industry: '$candidates.profile.industry',
          jobType: '$candidates.profile.jobType',
          prefferedLocation: '$candidates.profile.prefferedLocation',
          isProfileCompleted: '$candidates.profile.isProfileCompleted',
          },
        },
        },
      },
      },
      {
      $project: {
        _id: 0, // Exclude the _id field
        job: 1, // Include job details
        candidates: 1, // Include candidates array
      },
      },
    ];

    // Execute aggregation
    const result = await Applications.aggregate(aggregation);

    // Check if any data found
    if (!result.length) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(buildErrorObject(StatusCodes.NOT_FOUND, 'No applicants found for the given jobId'));
    }

    return res
      .status(StatusCodes.OK)
      .json(buildResponse(StatusCodes.OK, result[0]));
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};


// search integration in the getApplicationsDetails function
