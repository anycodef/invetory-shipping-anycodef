import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "List of inventory items" });
});

router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  res.json({ message: `Added ${quantity} of product ${productId} to inventory` });
});

export default router;
