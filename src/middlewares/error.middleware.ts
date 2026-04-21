import type { Request, Response, NextFunction } from "express";

type AppError = Error & {
  status?: number;
};

export function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
