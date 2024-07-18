import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
// Create an Express application
const app = express();

// set trust proxy
app.set("trust proxy", 1);

// Specify the port number for the server
const port = process.env.PORT;

// enable cors
app.use(cors());
app.options("*", cors());

// parse json request body
app.use(express.json());

// v1 api routes
app.use("/api", routes);

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
