// API versions
export const API_VERSION = {
  STUDENT_VESRSION: "/v" + process.env.STUDENT_API_VERSION || "0",
  CHECKINS_VESRSION: "/v" + process.env.CHECKINS_API_VERSION || "0",
};

export const ROUTES = {
  STUDENTS: API_VERSION.STUDENT_VESRSION + "/students",
  CHECKIN: API_VERSION.CHECKINS_VESRSION + "/checkins",
};
