import catchAsyncError from "../middleware/catchAsyncError.js";
import { DataService } from "../service/data.service.js";

export class StudentsController {
  dataService;
  constructor() {
    this.dataService = new DataService();
  }
  createStudent = catchAsyncError(async (req, res) => {
    const student = await this.dataService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: "student created successfully",
      student,
    });
  });

  getStudents = catchAsyncError(async (req, res) => {

    const students = await this.dataService.getStudents();
    res.status(200).json({
      success: true,
      message: "students fetched successfully",
      students,
    });
  });
}
