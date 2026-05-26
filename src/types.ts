export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type MatchType = 'singles' | 'doubles';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  skillLevel: SkillLevel;
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
  skillLevel: SkillLevel;
  matchType: MatchType;
  maxPlayers: number; // 2 for singles, 4 for doubles (or user specified)
  host: Player;
  playersJoined: Player[];
  hostNote: string;
}
