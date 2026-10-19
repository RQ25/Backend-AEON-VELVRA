import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/** CREATE SCHEMA WHEN AND NEW USER'S DATA, ALL OF FIELDS HAVE TO BE REQUIRE */
const addDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
});

export const verifyAddUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addDataSchema.validate(request.body);

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.message,
    });
  }
  next();
};

const idDataSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  password: Joi.string().optional(),
  role: Joi.string().optional(),
});

export const verifyEditUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = idDataSchema.validate(request.body);

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.message,
    });
  }
  next();
};