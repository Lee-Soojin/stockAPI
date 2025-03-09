import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

const getStockPrice = async (code) => {
  const url = `https://finance.naver.com/item/main.nhn?code=${code}`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const price = $(".no_today .blind").first().text();
    return price.replace(/,/g, "");
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return null;
  }
};

router.get("/:code", async (req, res) => {
  const code = req.params.code;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(async () => {
    const price = await getStockPrice(code);

    if (price) {
      res.json({ symbol: code, price });
    } else {
      res.status(500).json({ error: "Failed to fetch stock price" });
    }
  }, 5000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
