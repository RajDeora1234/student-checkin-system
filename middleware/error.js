import ErrorHandler from "../utils/errorHandler.js";
const errorMiddleware = (err, req, res, next) => {
  let error;
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    let message;
    switch (field) {
      case "email":
        message = "Email ID already exists.";
        break;
      case "student_id":
        message = "Student ID already exists.";
        break;
      default:
        message = `A duplicate value was entered for the field: ${field}.`;
    }
    error = new ErrorHandler(message, 400);
  } else if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ErrorHandler(messages.join(", "), 400);

  } else if (err instanceof ErrorHandler) {
    error = err;
  } else if (err instanceof Error) {
    error = new ErrorHandler(err.message, 500);
  } else {
    error = new ErrorHandler("Internal Server Error", 500);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

export default errorMiddleware;
