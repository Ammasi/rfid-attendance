import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

// Error handling middleware
const errorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  const status: number = err.status || 500;
  const message: string = err.message || "Something went wrong";
  res.status(status).json({
    success: false,
    status,
    message,
  });
};

export default errorHandler;