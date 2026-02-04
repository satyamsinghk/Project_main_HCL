const sendResponse = (res, statusCode, message, data = null) => {
  const success = statusCode >= 200 && statusCode < 300;
  res.status(statusCode).json({
    success,
    message,
    data,
    errorCode: success ? null : String(statusCode)
  });
};

module.exports = sendResponse;
