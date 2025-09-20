import catchAsyncError from "../middleware/catchAsyncError.js";
import { DataService } from "../service/data.service.js";
export class CheckInController {
  dataService;
  constructor() {
    this.dataService = new DataService();
  }
  studentCheckin = catchAsyncError(async (req, res) => {
    const studentCheckin = await this.dataService.studentCheckin(req.body);

    return res.status(201).json({
      success: true,
      message: "Student checked in successfully",
      studentCheckin: studentCheckin,
    });
  });

  checkedInStudents = catchAsyncError(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const studentCheckin = await this.dataService.checkedInStudents(page, limit);

    return res.status(200).json({
      success: true,
      message: "Checked in students fetched successfully",
      checkInStudents: studentCheckin,
    });
  });
}
