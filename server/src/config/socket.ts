import { Server } from "socket.io";
import { gameHandler } from "../socket/gameHandler";
import http from "http";

export function setupSocket(server: http.Server){
    const io = new Server(server,{
        cors:{
            origin:"*",
        }
    });
    io.on("connection",(socket)=>{
        console.log("User Connected :", socket.id);
        gameHandler(io,socket);
    })
}