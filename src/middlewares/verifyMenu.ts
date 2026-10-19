import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/** CREATE SCHEMA WHEN AND NEW MENU'S DATA, ALL OF FIELDS HAVE TO BE REQUIRE */
const addDataSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().required(),
  image: Joi.string().optional(),
  user: Joi.optional(),
  category: Joi.string().required(),
});

export const verifyAddMenu = (
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
  price: Joi.number().min(0).optional(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  category: Joi.string().optional(),
  user: Joi.optional()
});

export const verifyidMenu = (
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