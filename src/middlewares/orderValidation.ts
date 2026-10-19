import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Create Schema detail for order list
const orderListSchema = Joi.object({
  menuId: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  note: Joi.string().allow("", null).optional(),
});

// Input order
const addDataSchema = Joi.object({
  customer: Joi.string().required(),
  table_number: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  payment_method: Joi.string().valid("CASH", "QRIS", "CARD").uppercase().required(),
  status: Joi.string().valid("NEW", "PAID", "DONE").uppercase().default("NEW").optional(),
  userId: Joi.number().optional(),
  
  // ✅ FIX: Menerima 'orderList' (camelCase) ATAU 'orderlists' agar kompatibel
  orderList: Joi.array().items(orderListSchema).min(1).optional(),
  orderlists: Joi.array().items(orderListSchema).min(1).optional(),
  
  user: Joi.optional()
}).unknown(true); // .unknown(true) mencegah error jika ada field tambahan dari frontend

export const verifyAddOrder = (request: Request, response: Response, next: NextFunction) => {
  // Normalisasi data dari frontend jika terdeteksi 'orderlists' atau 'orderList'
  if (!request.body.orderList && request.body.orderlists) {
    request.body.orderList = request.body.orderlists;
  } else if (!request.body.orderlists && request.body.orderList) {
    request.body.orderlists = request.body.orderList;
  }

  /** validate a request body and grab error if exist */
  const { error } = addDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join(", ")
    });
  }
  return next();
};

// Order Status
const editDataSchema = Joi.object({
  status: Joi.string().valid("NEW", "PAID", "DONE").uppercase().required(),
  user: Joi.optional()
});

// Edit Status Order
export const verifyEditStatus = (request: Request, response: Response, next: NextFunction) => {
  const { error } = editDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join(", ")
    });
  }
  return next();
};