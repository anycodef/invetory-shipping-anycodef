import express from "express";
import dotenv from "dotenv";
import inventoryRoutes from "./routes/inventory.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// Rutas
app.use("/inventory", inventoryRoutes);

app.get("/", (req, res) => {
  res.send("Inventory Service is running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Inventory Service running on port ${PORT}`);
});
