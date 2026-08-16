export const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  throw error;
};

export const sendErrorResponse = (res, error, context = "") => {
  // Log unexpected errors
  if (!error.status) {
    console.error(`Unexpected error${context ? " in " + context : ""}:`, error);
  } else {
    // Log expected errors minimally
    console.info(`Error${context ? " in " + context : ""}:`, error.message);
  }

  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
};