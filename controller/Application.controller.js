import Applications from '../model/Application.schema.js';
import Jobs from '../model/Job.schema.js';

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
      return res.status(StatusCodes.NOT_FOUND).json(buildErrorObject(StatusCodes.NOT_FOUND, 'Job not found'));
    }

    const employerId = jobExists.organisation;

    const application = await Applications.findOneAndUpdate(
      { jobId, candidateId: id, employerId },
      { $setOnInsert: { jobId, candidateId: id, employerId } },
      { upsert: true, new: false }
    );

    if (application) {
      return res.status(StatusCodes.CONFLICT).json(buildErrorObject(StatusCodes.CONFLICT, 'Application already exists'));
    }

    return res
    .status(StatusCodes.CREATED)
    .json(buildResponse(StatusCodes.CREATED, 'Application Created Successfully'));

  } catch (err) {
    console.log("Error while creating application : ",err);
    handleError(res, err);
  }
}

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