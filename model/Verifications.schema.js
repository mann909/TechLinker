import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const VerificationsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    otp: { type: Number, required: true },
    validTill: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'Verifications',
  }
)


export default mongoose.model('Verifications', VerificationsSchema)