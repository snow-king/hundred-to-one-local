export type Status = 'setup' | 'playing' | 'finished'
export type ViewMode = 'split' | 'board' | 'control'

export interface Player {
  id: number
  name: string
  score: number
}

export interface QuestionAnswer {
  text: string
  points: number
}

export interface Question {
  id: number
  prompt: string
  answers: QuestionAnswer[]
}

export interface QuestionPack {
  id: string
  title: string
  description: string
  questions: Question[]
}

export interface OpenedAnswer extends QuestionAnswer {
  opened: boolean
}

export interface ActiveQuestion {
  id: number
  prompt: string
  answers: OpenedAnswer[]
}

export interface AnswerAttempt {
  questionId: number
  playerId: number
  answer: string
  isCorrect: boolean
  matchedText?: string
  pointsAwarded: number
  createdAt: string
}

export interface GameState {
  status: Status
  selectedPackId: string
  players: Player[]
  questions: ActiveQuestion[]
  currentQuestionIndex: number
  selectedPlayerId: number | null
  attempts: AnswerAttempt[]
}
