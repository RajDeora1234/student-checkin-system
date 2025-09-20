import express from "express";
import { CheckInController } from "../controller/checkin.controller.js";
export const checkinRouter = express.Router();

const checkinController = new CheckInController();
checkinRouter.post("/", checkinController.studentCheckin);

checkinRouter.get("/", checkinController.checkedInStudents);
