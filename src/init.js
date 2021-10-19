import "dotenv/config";
import "./db";
import "./models/User";
import "./models/Writing";
import app from "./server";

const PORT = process.env.PORT;

const handleListening = () => {
  console.log(`✅ Server listenting on port http://localhost:${PORT} 🚀`);
};

app.listen(PORT, handleListening);
