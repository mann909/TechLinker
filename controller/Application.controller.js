import Applications from '../model/Application.schema.js';
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
  
    const countAggregation = [
      {
        $match: {
          employerId: new mongoose.Types.ObjectId(employerId),
        },
      },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 },
        },
      },
      {
        $count: 'total'
      }
    ];
  
    const aggregation = [
      {
        $match: {
          employerId: new mongoose.Types.ObjectId(employerId),
        },
      },
      {
        $group: {
          _id: '$jobId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      {
        $unwind: '$job',
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ];
  
    const [totalResults] = await Applications.aggregate(countAggregation);
    const totalDocs = totalResults?.total || 0;
    const applications = await Applications.aggregate(aggregation);
  
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
  
    const paginationData = {
      docs: applications,
      totalDocs,
      limit,
      totalPages,
      page,
      pagingCounter: skip + 1,
      hasPrevPage,
      hasNextPage,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null
    };
  
    res
      .status(StatusCodes.OK)
      .json(buildResponse(StatusCodes.OK, paginationData));
  } catch (err) {
    console.log(err)
    handleError(res, err);
  }
}



export const getJobApplicantsDetails = async (req, res) => {
  try {
    req = matchedData(req);
    const { jobId } = req;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid jobId' });
    }

    const aggregation = [
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId), // Match specific jobId
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
          _id: '$jobId', // Group by jobId
          job: { $first: '$job' }, // Take the first job object
          candidates: { $push: '$candidates' }, // Collect candidates
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          job: 1, // Include job details
          candidates: 1, // Include candidate details
        },
      },
    ];

    // Execute aggregation
    const result = await Applications.aggregate(aggregation);

    // Check if any data found
    if (!result.length) {
      return res.status(404).json({ message: 'No applicants found for the given jobId' });
    }

    // Respond with transformed data
    res.status(200).json({
      message: 'Job applicants fetched successfully',
      data: result[0], // Send the single job object with candidates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


