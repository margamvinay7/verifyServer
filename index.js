import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import cors from "cors";
import researchRouter from "./routes/research.route.js";
import influencerRouter from "./routes/influencer.route.js";
import openai from "./config/openai.js";
// import cookieParser from "cookie-parser";
const port = process.env.PORT || 3001;

const app = express();

app.use(cors({ origin: "*" }));
// app.use(cors({ origin: "*", credentials: true }));
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.post("/apiKey", (req, res) => {
//   const { apiKey } = req.body;

//   if (!apiKey) {
//     return res.status(400).json({ message: "API Key is required" });
//   }

//   res.cookie("apiKey", apiKey, {
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000, //
//   });

//   res.json({ message: "API Key stored successfully!" });
// });
app.use("/", influencerRouter);
app.use("/research", researchRouter);

connectDB();

app.listen(port, () => {
  console.log("server running port", port);
});
