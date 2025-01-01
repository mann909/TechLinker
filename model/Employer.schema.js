import mongoose from 'mongoose'
import  paginate from 'mongoose-paginate-v2'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

const EmployerSchema = new mongoose.Schema({
    orgName:{
        type:String ,
        required:true
    },
    city:{
        type:String ,
        required:true
    } ,
    state:{
        type:String ,
        required:true 
    } ,
    mobile:{
        type:String ,
        required:true
 
    },

    email:{
        type:String ,
        required:true
    } ,
    website:{
        type:String ,
        required:true ,
    } ,
    about:{
        type:String ,
        required:true
    } ,
    password:{
        type:String ,
        required:true,
        select:false
    } ,
    isApproved:{
        type:Boolean ,
        required:true ,
        default:false
    } ,

    jobs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: []
    }] ,

    role:{
        type:String ,
        enum:['Candidate' , 'Employer'] ,
        default:'Employer'
    } ,
    status:{
        type:String ,
        default:'pending' ,
        enum:['pending' ,'approved' ,'rejected']
    }
  
} ,  {timestamps:true} )
EmployerSchema.plugin(paginate)
EmployerSchema.plugin(aggregatePaginate) 


export default mongoose.model('Employer'  ,EmployerSchema)