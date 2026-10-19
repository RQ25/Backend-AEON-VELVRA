import express from "express"
import {
  getAllUser,
  createUser,
  updateUser,
  deleteUser,
  changePictureUser,
  authentication,
} from "../controllers/userController"
import { verifyAuthentication } from "../middlewares/userValidation"
import { verifyAddUser, verifyEditUser } from "../middlewares/verifyUser"
import uploadFile from "../middlewares/uploadUser"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["MANAGER", "CASHIER"])], getAllUser)
app.post(`/`, [uploadFile.single("profile_picture"), verifyAddUser], createUser)
app.post(`/login`, [verifyAuthentication], authentication)
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("profile_picture"), verifyEditUser], updateUser)
app.put(`/pic/:id`, [verifyToken, verifyRole(["MANAGER", "CASHIER"]), uploadFile.single("profile_picture")], changePictureUser)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteUser)

export default app