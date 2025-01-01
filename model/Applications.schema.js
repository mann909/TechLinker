import mongoose from 'mongoose';


const ApplicationsSchema = new mongoose.Schema({
  candidateId:{ type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate' ,
    required: true,
  },
  jobId:{ type: mongoose.Schema.Types.ObjectId,
    ref: 'Job' ,
    required: true,
  },
  employerId:{ type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer' ,
    required: true,
  },
},{timestamps:true});

export default mongoose.model('Applications', ApplicationsSchema);