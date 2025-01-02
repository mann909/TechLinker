import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const ApplicationsSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
  },
  { timestamps: true }
);

ApplicationsSchema.plugin(paginate);
ApplicationsSchema.plugin(aggregatePaginate);

export default mongoose.model('Applications', ApplicationsSchema);
