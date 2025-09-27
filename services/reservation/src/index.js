import express from "express";
import dotenv from "dotenv";
import inventoryRoutes from "./routes/reservation.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// Rutas
app.use("/reservation", reservationRoutes);

app.get("/", (req, res) => {
  res.send("reservation Service is running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 reservation Service running on port ${PORT}`);
});
