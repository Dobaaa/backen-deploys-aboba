import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import workerRouter from "./routes/workerRoute.js";
import userRouter from "./routes/userRoute.js";
import paymentRouter from "./routes/paymentRoute.js";

//app config

const app = express();
const port = process.env.Port || 4000;
connectDB();
connectCloudinary();
// middlewares
app.use(express.json());
app.use(cors());

//api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/worker", workerRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);
app.get("/", (req, res) => {
  res.send("Api working boom");
});

app.listen(port, () => {
  console.log("server started ", port);
});
