import express from "express";
import {
  resgisterUser,
  LoginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointments,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();
userRouter.post("/register", resgisterUser);
userRouter.post("/login", LoginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointment", authUser, cancelAppointments);

export default userRouter;
