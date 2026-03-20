import {Player, Room} from "../types/room";
import { questions as questionBank } from "./questionBank";

const rooms: Record<string, Room> ={};


export function createRoom(roomId:string, player: any){
    rooms[roomId] = {
        roomId,
        players: [player],
        questions:shuffleArray([...questionBank]).slice(0,14),
        currentQuestionIndex: 0,
        hasAnswered:{},
        answers:{},
        timer: null,
        timeLeft: 30,
        score:0,
    }
}

export function joinRoom(roomId:string, player: Player){
    const room = rooms[roomId];

    if(!room) return {error:"Room not found"};
    if(room.players.length >= 2) return {error:"Room is full"};
    room.players.push(player);
    return{
        success:true,
        startGame: room.players.length === 2,
        players: room.players,
    };
}

export function getRoom(roomId:string){
    return rooms[roomId];
}

function shuffleArray(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5);
}
