import workerModel from "../models/workerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
const ChangeAvailabilty = async (req, res) => {
  try {
    const { workerId } = req.body;
    const WorkerData = await workerModel.findById(workerId);
    await workerModel.findByIdAndUpdate(workerId, {
      available: !WorkerData.available,
    });
    res.json({ success: true, message: "Availabilty Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const WorkerList = async (req, res) => {
  try {
    const workers = await workerModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, workers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api for worker login
const loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;
    const worker = await workerModel.findOne({ email });
    if (!worker) {
      return res.json({ success: false, message: "invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, worker.password);
    if (isMatch) {
      const token = jwt.sign({ id: worker._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// get all appointments worker pane

const appointmentsWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    const appointments = await appointmentModel.find({ workerId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to mark appointments completed for workers

const appointmentsComplete = async (req, res) => {
  try {
    const { workerId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.workerId === workerId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointments Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// api to mark appointments cancel for workers

const appointmentsCancel = async (req, res) => {
  try {
    const { workerId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.workerId === workerId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointments Cancelled" });
    } else {
      return res.json({ success: false, message: "cancellation  Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// dahsboard workerpanel

const workerDashboard = async (req, res) => {
  try {
    const { workerId } = req.body;
    const appointments = await appointmentModel.find({ workerId });
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let clients = [];
    appointments.map((item) => {
      if (!clients.includes(item.userId)) {
        clients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      clients: clients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api for worker profile

const workerProfile = async (req, res) => {
  try {
    const { workerId } = req.body;
    const profileData = await workerModel
      .findById(workerId)
      .select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api worker update data profile
const updateWorkerProfile = async (req, res) => {
  try {
    const { workerId, fees, address, available } = req.body;
    await workerModel.findByIdAndUpdate(workerId, { fees, address, available });
    res.json({ success: true, message: "profile updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
export {
  ChangeAvailabilty,
  WorkerList,
  loginWorker,
  appointmentsWorker,
  appointmentsComplete,
  appointmentsCancel,
  workerDashboard,
  workerProfile,
  updateWorkerProfile,
};
