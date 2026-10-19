import { Request, Response, NextFunction } from "express";

const validateEmail = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { email } = request.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return response.status(400).json({
      status: false,
      message: "Invalid email format",
    });
  }

  next();
};

export default validateEmail;
