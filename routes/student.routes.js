import express from "express";
import { StudentsController } from "../controller/student.controller.js";
const studentController = new StudentsController();

export const studentRouter = express.Router();

studentRouter
  .route("/")
  .post(studentController.createStudent)
  .get(studentController.getStudents);
