export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type Sport = 'Badminton' | 'Table Tennis' | 'Football' | 'Pickleball';
export type PlayAgain = 'yes' | 'no';
export type SkillAccuracy = 'too-high' | 'accurate' | 'too-low';

export interface Review {
  id?: string;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  playAgain: PlayAgain;
  skillAccuracy: SkillAccuracy;
  feedback: string;
  createdAt: number;
}
export type MatchType = 'singles' | 'doubles';
export type GenderPreference = 'male' | 'female' | 'open';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  skillLevel: SkillLevel;
  skillScore?: number; // 1–10 from assessment
  about?: string;
  sportsPlayed?: string[];
  matchPreferences?: string;
  sportingHistory?: string;
  industry?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
}

export interface MatchSession {
  id: string;
  date: string; // "YYYY-MM-DD" style
  timeStart: string; // "HH:MM" 24 hour
  timeEnd: string; // "HH:MM" 24 hour
  venue: string;
  address: string;
  sport: Sport;
  skillLevel: SkillLevel;
  matchType: MatchType;
  gender?: GenderPreference;
  maxPlayers: number; // 2 for singles, 4 for doubles (or user specified)
  host: Player;
  playersJoined: Player[];
  hostNote: string;
}
