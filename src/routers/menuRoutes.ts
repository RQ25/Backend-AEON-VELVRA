import express from "express";
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  changePicture,
} from "../controllers/menuController";
import { verifyAddMenu, verifyidMenu } from "../middlewares/verifyMenu";
import uploadFile from "../middlewares/uploadMenu";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

// ✅ DIBUKA PUBLIK: Customer & Staff bisa lihat daftar menu tanpa token JWT
app.get(`/`, getAllMenus);

// 🔒 PROTECTED: Hanya MANAGER yang bisa manipulasi menu
app.post(`/`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyAddMenu], createMenu);
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyidMenu], updateMenu);
app.put(`/pic/:id`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture")], changePicture);
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu);

export default app;