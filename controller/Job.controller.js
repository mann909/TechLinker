import Job from '../model/Job.schema.js'
import Employer from '../model/Employer.schema.js'
import buildErrorObject from '../utils/buildErrorObject.js'
import { StatusCodes } from 'http-status-codes'
import buildResponse from '../utils/buildResponse.js'
import handleError from '../utils/handleError.js'
import { matchedData } from 'express-validator'




export const listJob = async(req , res)=>{
    try{

        req= matchedData(req)

        const {post , payroll , qualifications ,openings,  description , employmentType , hiringProcess }=req

        const organisationId = req.user.id
        const employer = await Employer.findById(organisationId)
        if(!employer){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'No Organisation Found')
        }

        if(employer.status!=='approved'){
            throw buildErrorObject(StatusCodes.UNAUTHORIZED , 'You are Unauthorized')

        }

        if( !post || !payroll ||  !qualifications || !openings ||  !description || !employmentType || !hiringProcess){
            console.log({post , payroll , qualifications ,openings,  description , employmentType , hiringProcess })
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Parameters Missing')
        }
        console.log(employer)

        const newJob = await Job.create({
            organisation:employer._id,
            post , 
            payroll , 
            qualifications ,
            openings,  
            description ,
            employmentType ,
            hiringProcess

        })

        employer.jobs.push(newJob._id)
        await employer.save()

            res.
            status(StatusCodes.CREATED).
            json(buildResponse(StatusCodes.CREATED , {job:newJob}))
        



    }catch(err){
        handleError(res , err)

    }
}





export const searchJobs = async (req, res) => {
  try {
    // Extract validated query parameters
    const queryData = matchedData(req);
    const { hiringProcess, post, qualification, employmentType, city, search, state } = queryData;

    // Base match filter for JobModel
    const matchFilter = {
      isApproved: true,
    };

    // Dynamically add filters based on query parameters
    if (post) matchFilter.post = { $regex: post, $options: "i" };
    if (qualification) matchFilter.qualifications = { $regex: qualification, $options: "i" };
    if (employmentType) matchFilter.employmentType = { $regex: employmentType, $options: "i" };
    if (hiringProcess) matchFilter.hiringProcess = { $regex: hiringProcess, $options: "i" };

    // Search filter for description and organisation name
    const searchFilter = [];
    if (search) {
      searchFilter.push(
        { description: { $regex: search, $options: "i" } },
        { "organisationDetails.orgName": { $regex: search, $options: "i" } }
      );
    }

    console.log(city,state)

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "employers",
          localField: "organisation",
          foreignField: "_id",
          as: "organisationDetails",
        },
      },
      {
        $unwind: "$organisationDetails",
      },
      {
        $match: {
          ...matchFilter,
          ...(city && state
            ? {
                $and: [
                  { "organisationDetails.city": { $regex: city, $options: "i" } },
                  { "organisationDetails.state": { $regex: state, $options: "i" } },
                ],
              }
            : city
            ? { "organisationDetails.city": { $regex: city, $options: "i" } }
            : state
            ? { "organisationDetails.state": { $regex: state, $options: "i" } }
            : {}),
          ...(searchFilter.length && { $or: searchFilter }),
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
          createdAt:1,
          "organisationDetails.orgName": 1,
          "organisationDetails.city": 1,
          "organisationDetails.state": 1,
        },
      },
    ];

    // Execute the aggregation pipeline
    const jobs = await Job.aggregate(pipeline);

    // Return the response
    res.status(StatusCodes.OK).json(buildResponse(StatusCodes.OK, { jobs }));
  } catch (err) {
    handleError(res, err);
  }
};
