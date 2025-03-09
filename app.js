import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import Router from "./router/stock.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));

app.use("/stock", Router);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.sendStatus(500);
});

app.listen(8080);
