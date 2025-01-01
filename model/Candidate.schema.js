import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const CandidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true, select: false },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    role: {
      type: String,
      default: 'Candidate',
      enum: ['Candidate', 'Employer'],
    },
  },
  { timestamps: true }
);

CandidateSchema.plugin(paginate);
CandidateSchema.plugin(aggregatePaginate);

export default mongoose.model('Candidate', CandidateSchema);
