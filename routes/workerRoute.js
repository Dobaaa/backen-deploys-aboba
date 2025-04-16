import express from "express";
import {
  WorkerList,
  loginWorker,
  appointmentsWorker,
  appointmentsCancel,
  appointmentsComplete,
  workerDashboard,
  updateWorkerProfile,
  workerProfile,
} from "../controllers/workerController.js";
import authWorker from "../middlewares/authWorker.js";
const workerRouter = express.Router();

workerRouter.get("/list", WorkerList);
workerRouter.post("/login", loginWorker);
workerRouter.get("/appointments", authWorker, appointmentsWorker);
workerRouter.post("/complete-appointment", authWorker, appointmentsComplete);
workerRouter.post("/cancel-appointment", authWorker, appointmentsCancel);
workerRouter.get("/dashboard", authWorker, workerDashboard);
workerRouter.get("/profile", authWorker, workerProfile);
workerRouter.post("/update-profile", authWorker, updateWorkerProfile);

export default workerRouter;
