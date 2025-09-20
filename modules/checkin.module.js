import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

export const checkInModel = mongoose.model('CheckIn', checkInSchema);