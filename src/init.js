import "regenerator-runtime";
import "dotenv/config";
import "./db";
import "./models/video";
import "./models/user";
import "./models/comment";
import app from "./server.js";

const PORT = process.env.PORT || 4000;

const handleListening = () => {
  console.log(`✅ 서버 연결 완료! 💖 http://localhost:${PORT} 💖`);
};

app.listen(PORT, handleListening);
