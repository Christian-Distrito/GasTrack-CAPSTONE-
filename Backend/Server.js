import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./Routes/auth.js";
import usersRouter from "./Routes/users.js";
import productsRouter from "./Routes/products.js";
import inventoryRouter from "./Routes/inventory.js";
import suppliersRouter from "./Routes/suppliers.js";
import salesRouter from "./Routes/sales.js";
import companiesRouter from "./Routes/companies.js";
import createAccountRouter from "./Routes/createAccount.js";
import posRouter from "./Routes/pos.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/sales", salesRouter);
app.use("/api/auth/customer", createAccountRouter); // Register new customer accounts
app.use("/api/pos", posRouter);

app.get("/", (req, res) => {
  res.send("GasTrack API is running.");
});

app.listen(PORT, () => {
  console.log(`GasTrack API listening on http://localhost:${PORT}`);
});