const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    // error = new ErrorResponse(message, 404);
    res.status(404).json({ error: 1, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    res.status(400).json({ error: 1, message });
  }
};

module.exports = errorHandler;
