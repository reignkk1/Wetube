import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

const handleOpen = () => console.log("✅ DB 연결완료!");
const handleError = (error) => console.log("DB 에러 발생❗ ", error);

//=======================================================================

db.on("error", handleError);
db.once("open", handleOpen);
