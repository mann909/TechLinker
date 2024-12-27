import mongoose from "mongoose"
import  paginate from 'mongoose-paginate-v2'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'
const JobModel = new mongoose.Schema({
    organisation:{
        type:mongoose.Schema.Types.ObjectId ,
        ref:'Employer'
    } ,
    post:{
        type:String ,
        required:true
    } ,
    payroll:{
        type:String ,
        required:true
    } ,
    qualifications:[{
        type:String
    }] ,
    openings:{
        type:Number ,
        required:true
    } ,
    description:{
        type:String ,
        required:true
    } ,
    employmentType:{
        type:String , 
        required:true
    } ,
    hiringProcess:{
        type:String ,
        enum:['Walk In'  , 'Online'] ,
        required:true
    } ,
    isApproved:{
        type:Boolean , 
        default:false , 
        required:true
    }
    
} ,  {timestamps:true})
JobModel.plugin(paginate)
JobModel.plugin(aggregatePaginate)

export default mongoose.model('Job' , JobModel)