const catchAsyncError = (tryFunction) => (req, res, next) => {
  Promise.resolve(tryFunction(req, res, next)).catch(next);
};

export default catchAsyncError;
