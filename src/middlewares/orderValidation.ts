import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

// Create Schema detail for order list
const orderListSchema = Joi.object({
  menuId: Joi.number().required(),
  quantity: Joi.number().min(1).required(),
  note: Joi.string().allow("").optional(), // ✅ Izinkan string kosong
});

// Input order
const addDataSchema = Joi.object({
  customer: Joi.string().required(),
  table_number: Joi.string().required(), // ✅ Ubah ke string agar sesuai tipe Prisma & Frontend
  payment_method: Joi.string().valid("CASH", "QRIS", "CARD").uppercase().required(), // ✅ Tambahkan "CARD"
  status: Joi.string().valid("NEW", "PAID", "DONE").uppercase().default("NEW").optional(), // ✅ Dibuat opsional dengan default "NEW"
  userId: Joi.number().optional(),
  orderlists: Joi.array().items(orderListSchema).min(1).required(),
  user: Joi.optional()
});

export const verifyAddOrder = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = addDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map(it => it.message).join()
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
      message: error.details.map(it => it.message).join()
    });
  }
  return next();
};