import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
const JobModel = new mongoose.Schema(
  {
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
    },
    post: {
      type: String,
      required: true,
    },
    payroll: {
      type: String,
      required: true,
    },
    qualifications: [
      {
        type: String,
      },
    ],
    openings: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    employmentType: {
      type: String,
      required: true,
      enum: ['Full Time', 'Part Time'],
    },
    hiringProcess: {
      type: String,
      enum: ['Walk In', 'Online'],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true,
    },

    minExperience: {
      type: String,
      required: true,
      default: '0',
    },

    status: {
      type: String,
      default: 'pending',
    },
  },
  { timestamps: true }
);
JobModel.plugin(paginate);
JobModel.plugin(aggregatePaginate);

export default mongoose.model('Job', JobModel);
