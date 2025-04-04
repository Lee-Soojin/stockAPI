import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

const getStockPrice = async (code) => {
  const url = `https://finance.naver.com/item/main.nhn?code=${code}`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const price = $(".no_today .blind").first().text().replace(/,/g, "");

    const changeElement = $(".no_exday em").first();
    const change = changeElement.find(".blind").text().replace(/,/g, "");
    const directionClass = changeElement.attr("class") || "";
    let direction = "보합";
    if (directionClass.includes("nv01")) {
      direction = "상승";
    } else if (directionClass.includes("nv02")) {
      direction = "하락";
    }

    return { price, change, direction };
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

  const sendStockPrice = async () => {
    const data = await getStockPrice(code);

    if (data) {
      res.write(
        `data: ${JSON.stringify({
          symbol: code,
          price: Number(data.price),
          change: Number(data.change),
          direction: data.direction,
        })}\n\n`
      );
    } else {
      res.write(
        `data: ${JSON.stringify({ error: "Failed to fetch stock price" })}\n\n`
      );
    }
  };

  const interval = setInterval(sendStockPrice, 5000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });

  await sendStockPrice();
});

export default router;
