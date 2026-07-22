import express from "express"
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import connectDB from "./config/db.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app=express();

app.use(cors()) // it will enable Cross-origin resource sharing Means connect backend with
app.use(express.json())
app.use(clerkMiddleware())

// API to listen clerk Webhooks

app.use("/api/clerk",clerkWebhooks);

app.get('/',(req,res)=>{
  res.send("Api Is Running Fine");
})

const port=process.env.port || 3000;

app.listen(port,()=>{
  console.log("Server running on port",port);
})