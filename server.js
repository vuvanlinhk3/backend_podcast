import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Cấu hình CORS (cho phép localhost trong dev)
app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ cho phép origin từ React app
  })
);

app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  // Kiểm tra URL
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Thiếu hoặc URL không hợp lệ" });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "audio/mpeg, application/octet-stream", // Hỗ trợ tệp âm thanh
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi từ server (${response.status}): ${response.statusText}`);
    }

    // Lấy Content-Type từ server gốc
    const contentType = response.headers.get("Content-Type") || "audio/mpeg";
    res.set("Content-Type", contentType);

    // Stream dữ liệu âm thanh trực tiếp
    response.body.pipe(res);
  } catch (err) {
    console.error("Lỗi proxy:", err);
    res.status(500).json({ error: "Lỗi fetch dữ liệu: " + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));