import { studentModel } from "../modules/student.module.js";
import { checkInModel } from "../modules/checkin.module.js";
import ErrorHandler from "../utils/errorHandler.js";

export class DataService {
  studentModel;
  checkInModel;
  constructor() {
    this.studentModel = studentModel;
    this.checkInModel = checkInModel;
  }

  async createStudent(studentData) {
    const {
      name,
      email,
      studentId: student_id,
      district,
      state,
      country,
      pincode,
    } = studentData;

    if (
      name.trim().length == 0 ||
      email.trim().length == 0 ||
      student_id.trim().length == 0 ||
      pincode.trim().length == 0 ||
      district.trim().length == 0 ||
      state.trim().length == 0 ||
      country.trim().length == 0
    ) {
      throw new ErrorHandler("All fields are required.", 400);
    }
    const existingStudent = await this.studentModel.findOne({
      $or: [{ email }, { student_id }],
    });
    if (existingStudent) {
      throw new ErrorHandler(
        "Student already exists with email or student ID.",
        400
      );
    }
    const newStudent = await this.studentModel.create({
      name,
      email,
      student_id,
      pincode: Number(pincode),
      district,
      state,
      country,
    });
    return newStudent;
  }

  async getStudents() {
    return await this.studentModel.find({});
  }

  async studentCheckin(studentData) {
    const { student_id, timestamp } = studentData;
    if (student_id.trim().length == 0) {
      throw new ErrorHandler("Please enter student ID", 400);
    }
    const student = await this.studentModel.findOne({ student_id });
    if (!student) {
      throw new ErrorHandler("Student not found", 400);
    }
    const updatedCheckIn = await this.checkInModel.findOneAndUpdate(
      { student: student._id },
      { timestamp: timestamp },
      { new: true, upsert: true }
    );

    if (!updatedCheckIn) {
      throw new ErrorHandler("Failed to update check-in record.", 500);
    }
    return updatedCheckIn;
  }

  async checkedInStudents() {
    const checkIns = await this.checkInModel
      .find({})
      .populate("student", "name student_id email");

    return checkIns;
  }
}
