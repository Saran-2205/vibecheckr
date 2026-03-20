import { Server, Socket } from "socket.io";
import { createRoom, getRoom, joinRoom, findRoomByPlayer, removePlayer } from "../rooms/roomManager";

type CreateRoomPayLoad = {
  name: string;
};

type JoinRoomPayLoad = {
  roomId: string;
  name: string;
};

type Callback = (response: any) => void;

function handleTimeout(io: any, roomId: string) {
  const room = getRoom(roomId);
  if (!room) return;

  const answers = Object.values(room.answers);

  let isMatch = false;

  if (answers.length === 2) {
    isMatch = answers[0] === answers[1];
    if (isMatch) room.score += 10;
  }

  io.to(roomId).emit("answerResult", {
    answers,
    isMatch,
    score: room.score,
    timeout: true,
  });

  room.answers = {};
  room.hasAnswered = {};

  room.currentQuestionIndex++;

  setTimeout(() => {
    if (room.currentQuestionIndex < room.questions.length) {
      io.to(roomId).emit("question", {
        question: room.questions[room.currentQuestionIndex],
        questionIndex: room.currentQuestionIndex + 1,
        totalQuestions: room.questions.length
      });

      startTimer(io, roomId); // 🔥 restart timer
    } else {
      io.to(roomId).emit("gameOver", {
        finalScore: room.score,
      });
    }
  }, 4000); // 4 seconds delay
}

function startTimer(io: any, roomId: string) {
  const room = getRoom(roomId);
  if (!room) return;

  room.timeLeft = 30;

  room.timer = setInterval(() => {
    room.timeLeft--;

    io.to(roomId).emit("timer", {
      timeLeft: room.timeLeft,
    });

    if (room.timeLeft <= 0) {
      clearInterval(room.timer!);
      room.timer = null;

      handleTimeout(io, roomId);
    }
  }, 1000);
}

export function gameHandler(io: Server, socket: Socket) {
  socket.on("createRoom", ({ name }: CreateRoomPayLoad, cb: Callback) => {
    const roomId = Math.random().toString(36).substring(2, 8);
    createRoom(roomId, { id: socket.id, name });
    socket.join(roomId);
    cb({ roomId });
  });

  socket.on("joinRoom", ({ roomId, name }: JoinRoomPayLoad, cb: Callback) => {
    const result = joinRoom(roomId, { id: socket.id, name });
    if (result.error) return cb(result);
    socket.join(roomId);
    if (result.startGame) {
      io.to(roomId).emit("startGame", { players: result.players });

      const room = getRoom(roomId);

      if (room) {
        io.to(roomId).emit("question", {
          question: room.questions[room.currentQuestionIndex],
          questionIndex: room.currentQuestionIndex + 1,
          totalQuestions: room.questions.length
        });
        startTimer(io, roomId); // 🔥 start timer
      }
    }
    cb({ success: true });
  });

  socket.on("submitAnswer", ({ roomId, answer }, cb) => {
    const room = getRoom(roomId);

    if (!room) return;

    if (room.hasAnswered[socket.id]) {
      return;
    }

    // store answer
    room.answers[socket.id] = answer;
    room.hasAnswered[socket.id] = true;

    // check if both answered
    if (Object.keys(room.answers).length === 2) {
      if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
      }

      const answers = Object.values(room.answers);

      const isMatch = answers[0] === answers[1];

      if (isMatch) {
        room.score += 10;
      }

      // send result
      io.to(roomId).emit("answerResult", {
        answers,
        isMatch,
        score: room.score,
      });

      // reset answers
      room.answers = {};
      room.hasAnswered = {};

      // move to next question
      room.currentQuestionIndex++;

      // delay before sending the next question
      setTimeout(() => {
        if (room.currentQuestionIndex < room.questions.length) {
          io.to(roomId).emit("question", {
            question: room.questions[room.currentQuestionIndex],
            questionIndex: room.currentQuestionIndex + 1,
            totalQuestions: room.questions.length
          });
          startTimer(io, roomId);
        } else {
          if ((room.score) >= 90) {
            io.to(roomId).emit("gameWon", {
              finalScore: room.score,
            })
          } else {
            io.to(roomId).emit("gameOver", {
              finalScore: room.score,
            });
          }
        }
      }, 4000); // 4 seconds delay
    }

    cb({ success: true });
  });

  socket.on("disconnect", () => {
    const room = findRoomByPlayer(socket.id);
    if (room) {
      const remaining = removePlayer(room.roomId, socket.id);
      if (remaining && remaining > 0) {
        io.to(room.roomId).emit("playerDisconnected");
        if (room.timer) {
          clearInterval(room.timer);
          room.timer = null;
        }
      }
    }
  });
}
