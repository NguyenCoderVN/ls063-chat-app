import { createServer } from "http";
import app from "./src/app";
import { connectDB } from "./src/config/database";
import { initializeSocket } from "./src/utils/socket";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
initializeSocket(httpServer);
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
