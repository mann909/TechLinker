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