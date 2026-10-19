import express from "express";
import { getAllOrders, createOrder, updateStatusOrder, deleteOrder } from "../controllers/orderController";
import { verifyAddOrder, verifyEditStatus } from "../middlewares/orderValidation";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.get(`/`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllOrders);
app.post(`/`, [verifyAddOrder], createOrder);
app.put(`/:id`, [verifyToken, verifyRole(["CASHIER", "MANAGER"]), verifyEditStatus], updateStatusOrder);
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteOrder);

export default app;