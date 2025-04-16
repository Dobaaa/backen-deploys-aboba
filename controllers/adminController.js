import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import workerModel from "../models/workerModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
// Api for Adding worker
const addWorker = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    // Check if image file is provided
    if (!imageFile) {
      return res.json({ success: false, message: "Image file is required" });
    }
    //cheking all data to add workers
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing  Details" });
    }

    // validating email format

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "please enter a valid email",
      });
    }

    //vaild password
    if (password < 8) {
      return res.json({
        success: false,
        message: "please enter a strong password",
      });
    }

    //hashing worker password
    const salt = await bcrypt.genSalt(10);
    const hashedPasword = await bcrypt.hash(password, salt);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const workerData = {
      name,
      email,
      image: imageUrl,
      password: hashedPasword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newWorker = new workerModel(workerData);
    await newWorker.save();

    res.json({ success: true, message: "worker added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//APi for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get all workers list
const allWorkers = async (req, res) => {
  try {
    const workers = await workerModel.find({}).select("-password");
    res.json({ success: true, workers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get all appointemnts

const appointemtsAdmin = async (req, res) => {
  try {
    const appointements = await appointmentModel.find({});
    res.json({ success: true, appointements });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//cancel appointment admin api
const cancelAppointmentsAdmin = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { workerId, slotDate, slotTime } = appointmentData;
    const workerData = await workerModel.findById(workerId);
    let slots_booked = workerData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );
    await workerModel.findByIdAndUpdate(workerId, { slots_booked });
    res.json({ success: true, message: "Appointment is Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for dashboard
const adminDashboard = async (req, res) => {
  try {
    const workers = await workerModel.find({});
    const users = await userModel.find({});
    const appointements = await appointmentModel.find({});
    const dashData = {
      workers: workers.length,
      appointements: appointements.length,
      clients: users.length,
      latestAppointments: appointements.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export {
  addWorker,
  loginAdmin,
  allWorkers,
  appointemtsAdmin,
  cancelAppointmentsAdmin,
  adminDashboard,
};
