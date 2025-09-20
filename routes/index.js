import { Router } from "express";
import { ROUTES } from "../constants.js";
import { studentRouter } from "./student.routes.js";
import { checkinRouter } from "./checkin.routes.js";

export const routes = Router();

routes.use(`${ROUTES.STUDENTS}`, studentRouter);
routes.use(`${ROUTES.CHECKIN}`, checkinRouter);
