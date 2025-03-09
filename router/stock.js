import express from "express";
import axios from "axios";
const api_key = process.env.API_KEY;

const router = express.Router();

router.get("/search", async (req, res, next) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  const response = await axios.get(
    `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${api_key}`
  );
  res.status(200).json(response.data.bestMatches);
});

export default router;
