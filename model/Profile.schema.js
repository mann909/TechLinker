import mongoose from 'mongoose' 


const JobProfile = new mongoose.Schema({
   userId:{
      type: mongoose.Schema.Types.ObjectId,
   } ,
    subLocation:{
        type: String,
    } ,
    maritalStatus:{
        type: String,
        enum:['Married' , 'Unmarried']
    } ,
    dob:{
        type : String,
    } ,
    gender:{
        type : String,

    } , 
    language:{
        type : [String]
    } 
     ,
     englishFluency:{
        type : String,
     } ,
     currentAddress:{
        type : String,
     } ,

     permanentAddress:{
        type : String,
     } ,

     panCardNumber:{
        type:String ,
     } ,
     panCardFile:{
        type : String,
     } ,
     drivingLicenseNumber:{
        type : String,
     } ,
     drivingLicenseFile:{
        type:String ,
     } ,
     passPortNumber:{
        type : String,
     } ,
     passPortFile:{
        type:String ,
     } ,
     workExperience:{
      type:String ,
     } ,

     resumeFile:{
      type:String ,
     } ,
     currentCompany:{
      type:String ,
     } ,
     previousCompany:{
      type:String , 
     } ,
     course:{
      type:String
  } ,
  passingYear:{
      type:String
  } ,
  marks:{
      type:String
  } ,

  role:{
   type:String
  } ,
  subRole:{
   type:String
  } ,
  industry:{
   type:String , 
  } ,
  jobType:{
   type:String 
  } ,
  prefferedLocation:{
   type:String
  },
  isProfileCompleted:{
   type:Boolean ,
   default:false
  }




})


export default mongoose.model('Profile', JobProfile)
