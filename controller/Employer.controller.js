import { StatusCodes } from 'http-status-codes'
import Employer from '../model/Employer.schema.js'
import buildErrorObject from '../utils/buildErrorObject.js'
import handleError from '../utils/handleError.js'
import bcrypt from 'bcrypt'
import buildResponse from '../utils/buildResponse.js'

export const registerEmployer = async(req , res)=>{
    try{

        const {orgName , city , state , mobile , website , about , email , password} = req.body

        const existingOrganisation = await Employer.findOne({
            $or: [
            { website: website },
            { mobile: mobile }
            ]
        })



        if(existingOrganisation){
            throw buildErrorObject(StatusCodes.CONFLICT , 'Website or Mobile Number has been already used')
        }
        if(!orgName || !city || !state || !mobile || !website || !about || !email || !password){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Missing Parameters')
        }

        const hashedPassword = await bcrypt.hash(password , 10)

        const newEmployer = await Employer.create({
            orgName , city , state , mobile , website , about , email , password:hashedPassword
        })

        const employer = {
            orgName: newEmployer.orgName,
            city: newEmployer.city,
            state: newEmployer.state,
            mobile: newEmployer.mobile,
            website: newEmployer.website,
            about: newEmployer.about,
            email: newEmployer.email ,
            isApproved:false
        }

       res.status(StatusCodes.CREATED).json(buildResponse(StatusCodes.CREATED , {employer}))



    }catch(err){
        handleError(res , err)

    }
}



export const loginEmployer = async(req , res)=>{
    try{
        const {email , password}= req.body ;
        if(!email || !password){
           throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Missing Parameters')
        }

        let employer = await Employer.findOne({email:email}).select('+password')

        if(!employer){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'No Such Employer Found')
        }

        if(employer.role!=='Employer'){
            throw buildErrorObject(StatusCodes.UNAUTHORIZED , 'You are not authorized to login as employer')
        }

        if(!await bcrypt.compare(password , employer.password)){
            throw buildErrorObject(StatusCodes.BAD_REQUEST , 'Incorrect Password')
        }
        const user={
            id:employer._id ,
            role:employer.role
        }

        const {accessToken , refreshToken} = generateTokens(user)
        console.log(accessToken , refreshToken)
        employer = await Employer.findById(employer._id).select('-password').lean()
        

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
        .json(buildResponse(StatusCodes.ACCEPTED, {employer}))



    }catch(err){
        handleError(res ,err)

    }
}