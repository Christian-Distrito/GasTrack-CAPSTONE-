import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import salesRouter from "./routes/sales.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount route groups here as you build more of them:
// app.use("/api/users", usersRouter);
// app.use("/api/products", productsRouter);
// app.use("/api/inventory", inventoryRouter);
app.use("/api/sales", salesRouter);

app.get("/", (req, res) => {
  res.send("GasTrack API is running.");
});

app.listen(PORT, () => {
  console.log(`GasTrack API listening on http://localhost:${PORT}`);
});