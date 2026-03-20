export type Player = {
  id: string;
  name: string;
};

export type Question = {
    id: string;
    question: string;
    options: string[];
    category:string;
};

export type Room = {
    roomId: string;
    players: Player[];
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string,string>;
    hasAnswered: Record<string, boolean>;
    timer: NodeJS.Timeout | null;
    timeLeft: number;
    score: number; 
}