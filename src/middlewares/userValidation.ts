import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
});

export const verifyAuthentication = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = authSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    });
  }
  return next();
};
