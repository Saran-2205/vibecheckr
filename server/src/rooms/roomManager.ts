import {Player, Room} from "../types/room";
import { questions as questionBank } from "./questionBank";

const rooms: Record<string, Room> ={};


export function createRoom(roomId:string, player: any){
    rooms[roomId] = {
        roomId,
        players: [player],
        questions:shuffleArray([...questionBank]).slice(0,15),
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

export function findRoomByPlayer(playerId: string) {
    for (const roomId in rooms) {
        if (rooms[roomId].players.some((p: any) => p.id === playerId)) {
            return rooms[roomId];
        }
    }
    return null;
}

export function removePlayer(roomId: string, playerId: string) {
    const room = rooms[roomId];
    if (!room) return 0;
    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
        if (room.timer) clearInterval(room.timer);
        delete rooms[roomId];
    }
    return room.players.length;
}

function shuffleArray(arr: any[]) {
  return arr.sort(() => Math.random() - 0.5);
}
