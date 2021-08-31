import "dotenv/config";
import "./db";
import "./models/User";
import "./models/Writing";
import app from "./server";

const PORT = 8080;

const handleListening = () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
};

app.listen(PORT, handleListening);
