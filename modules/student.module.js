import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        // Email must end with at least 2 alphabetic characters
        return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: "Please enter a valid email address",
    },
  },
  student_id: { type: String, required: true, unique: true, trim: true },
  pincode: { type: Number },
  district: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const studentModel = mongoose.model("Student", studentSchema);
