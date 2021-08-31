import "dotenv/config";
import "./db";
import "./models/User";
import "./models/Writing";
import app from "./server";
import http from "http";

const PORT = 8080;

const handleListening = () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
};

http.createServer(app).listen(PORT, handleListening);

// app.listen(PORT, handleListening);
