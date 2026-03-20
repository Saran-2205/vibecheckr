import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { setupSocket } from "./config/socket";


const app = express();
app.use(cors());
app.get('/',(req,res)=>{
    res.send("backend working")
})

const server = http.createServer(app);

setupSocket(server);

server.listen(5000,()=>{
    console.log("Server is running on port 5000");
})