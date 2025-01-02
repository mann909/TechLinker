import Job from '../model/Job.schema.js';
import Employer from '../model/Employer.schema.js';
import mongoose from 'mongoose';
import buildErrorObject from '../utils/buildErrorObject.js';
import { StatusCodes } from 'http-status-codes';
import buildResponse from '../utils/buildResponse.js';
import handleError from '../utils/handleError.js';
import { matchedData } from 'express-validator';

export const listJob = async (req, res) => {
  try {
    const organisationId = req.user.id;
    req = matchedData(req);

    const {
      post,
      payroll,
      qualifications,
      openings,
      description,
      employmentType,
      hiringProcess,
      minExperience,
    } = req;

    const employer = await Employer.findById(organisationId);
    if (!employer) {
      throw buildErrorObject(StatusCodes.BAD_REQUEST, 'No Organisation Found');
    }

    if (employer.status !== 'approved') {
      throw buildErrorObject(StatusCodes.UNAUTHORIZED, 'You are Unauthorized');
    }

    const newJob = await Job.create({
      organisation: employer._id,
      post,
      payroll,
      qualifications,
      openings,
      description,
      employmentType,
      hiringProcess,
      minExperience,
    });

    employer.jobs.push(newJob._id);
    await employer.save();

    res
      .status(StatusCodes.CREATED)
      .json(buildResponse(StatusCodes.CREATED, { job: newJob }));
  } catch (err) {
    console.log(err);
    handleError(res, err);
  }
};

// export const searchJobs = async (req, res) => {
//   try {
//     // Extract validated query parameters
//     const queryData = matchedData(req);
//     const {
//       hiringProcess,
//       post,
//       qualification,
//       employmentType,
//       city,
//       search,
//       state,
//     } = queryData;

//     // Base match filter for JobModel
//     const matchFilter = {
//       isApproved: true,
//     };

//     // Dynamically add filters based on query parameters
//     if (post) matchFilter.post = { $regex: post, $options: 'i' };
//     if (qualification)
//       matchFilter.qualifications = { $regex: qualification, $options: 'i' };
//     if (employmentType)
//       matchFilter.employmentType = { $regex: employmentType, $options: 'i' };
//     if (hiringProcess)
//       matchFilter.hiringProcess = { $regex: hiringProcess, $options: 'i' };

//     // Search filter for description and organisation name
//     const searchFilter = [];
//     if (search) {
//       searchFilter.push(
//         { description: { $regex: search, $options: 'i' } },
//         { 'organisationDetails.orgName': { $regex: search, $options: 'i' } }
//       );
//     }

//     console.log(city, state);

//     // Aggregation pipeline
//     const pipeline = [
//       {
//         $lookup: {
//           from: 'employers',
//           localField: 'organisation',
//           foreignField: '_id',
//           as: 'organisationDetails',
//         },
//       },
//       {
//         $unwind: '$organisationDetails',
//       },
//       {
//         $match: {
//           ...matchFilter,
//           ...(city && state
//             ? {
//               $and: [
//                 {
//                   'organisationDetails.city': { $regex: city, $options: 'i' },
//                 },
//                 {
//                   'organisationDetails.state': {
//                     $regex: state,
//                     $options: 'i',
//                   },
//                 },
//               ],
//             }
//             : city
//               ? { 'organisationDetails.city': { $regex: city, $options: 'i' } }
//               : state
//                 ? {
//                   'organisationDetails.state': {
//                     $regex: state,
//                     $options: 'i',
//                   },
//                 }
//                 : {}),
//           ...(searchFilter.length && { $or: searchFilter }),
//         },
//       },
//       {
//         $project: {
//           post: 1,
//           payroll: 1,
//           qualifications: 1,
//           openings: 1,
//           description: 1,
//           employmentType: 1,
//           hiringProcess: 1,
//           isApproved: 1,
//           createdAt: 1,
//           'organisationDetails.orgName': 1,
//           'organisationDetails.city': 1,
//           'organisationDetails.state': 1,
//         },
//       },
//     ];

//     // Execute the aggregation pipeline
//     const jobs = await Job.aggregate(pipeline);

//     // Return the response
//     res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK, { jobs }));
//   } catch (err) {
//     handleError(res, err);
//   }
// }

export const searchJobs = async (req, res) => {
  try {
    const queryData = matchedData(req);
    const {
      hiringProcess,
      post,
      qualification,
      employmentType,
      city,
      search,
      state,
    } = queryData;

    const candidateId = new mongoose.Types.ObjectId(req.user.id);

    const matchFilter = {
      isApproved: true,
    };

    if (post) matchFilter.post = { $regex: post, $options: 'i' };
    if (qualification)
      matchFilter.qualifications = { $regex: qualification, $options: 'i' };
    if (employmentType)
      matchFilter.employmentType = { $regex: employmentType, $options: 'i' };
    if (hiringProcess)
      matchFilter.hiringProcess = { $regex: hiringProcess, $options: 'i' };

    const searchFilter = [];
    if (search) {
      searchFilter.push(
        { description: { $regex: search, $options: 'i' } },
        { 'organisationDetails.orgName': { $regex: search, $options: 'i' } }
      );
    }

    // Modified pipeline with debugging logs
    const pipeline = [
      {
        $lookup: {
          from: 'employers',
          localField: 'organisation',
          foreignField: '_id',
          as: 'organisationDetails',
        },
      },
      {
        $unwind: '$organisationDetails',
      },
      {
        $match: {
          ...matchFilter,
          ...(city && state
            ? {
                $and: [
                  {
                    'organisationDetails.city': { $regex: city, $options: 'i' },
                  },
                  {
                    'organisationDetails.state': {
                      $regex: state,
                      $options: 'i',
                    },
                  },
                ],
              }
            : city
              ? { 'organisationDetails.city': { $regex: city, $options: 'i' } }
              : state
                ? {
                    'organisationDetails.state': {
                      $regex: state,
                      $options: 'i',
                    },
                  }
                : {}),
          ...(searchFilter.length && { $or: searchFilter }),
        },
      },
      // Add a stage to see the job IDs for debugging
      {
        $addFields: {
          debugJobId: { $toString: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'applications',
          let: {
            jobId: '$_id',
            debug_job_string: { $toString: '$_id' },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$jobId',
                        {
                          $toObjectId: '$$debug_job_string',
                        },
                      ],
                    },
                    {
                      $eq: ['$candidateId', candidateId],
                    },
                  ],
                },
              },
            },
          ],
          as: 'applicationStatus',
        },
      },
      // Add debug information
      {
        $addFields: {
          applied: { $gt: [{ $size: '$applicationStatus' }, 0] },
          debugInfo: {
            applicationCount: { $size: '$applicationStatus' },
            applications: '$applicationStatus',
            currentJobId: '$_id',
            currentCandidateId: candidateId,
          },
        },
      },
      {
        $project: {
          post: 1,
          payroll: 1,
          qualifications: 1,
          openings: 1,
          description: 1,
          employmentType: 1,
          hiringProcess: 1,
          isApproved: 1,
          createdAt: 1,
          applied: 1,
          minExperience: 1,
          debugInfo: 1, // Keep this for debugging
          'organisationDetails.orgName': 1,
          'organisationDetails.city': 1,
          'organisationDetails.state': 1,
        },
      },
    ];

    // Execute the pipeline
    const jobs = await Job.aggregate(pipeline);

    // Add some console logs for debugging

    // Return the response
    res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK, { jobs }));
  } catch (err) {
    console.error('Pipeline error:', err);
    handleError(res, err);
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(
          buildResponse(StatusCodes.NOT_FOUND, { message: 'Job not found' })
        );
    }

    const existingApplication = await Applications.findOne({
      jobId,
      candidateId,
    });

    if (existingApplication) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          buildResponse(StatusCodes.BAD_REQUEST, {
            message: 'Already applied to this job',
          })
        );
    }

    await Applications.create({
      candidateId,
      jobId,
      employerId: job.organisation,
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        buildResponse(StatusCodes.CREATED, {
          message: 'Application submitted successfully',
        })
      );
  } catch (err) {
    handleError(res, err);
  }
};
