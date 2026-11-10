export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://hot-coffee-backend.onrender.com";

const TOKEN_KEY = "hc_token";
export const LYCAN_DISCORD_ID = "1067139507922681978";

export interface RankInfo {
  rank: string;
  tier: string;
  displayName: string;
  isRp: boolean;
  lp: number;
  rp: number;
  points: number;
  lpToNext: number;
  next: string;
  nextIsRp: boolean;
  divisionIndex: number;
  progress: number;
  iconPath: string;
  color: string;
}

export interface Character {
  id: string;
  name: string;
}

export interface Team {
  point: Character;
  assist: Character;
  fuse: Character;
}

export interface Fight {
  id: number;
  playedAt: string;
  result: "WIN" | "LOSS";
  scoreFor: number;
  scoreAgainst: number;
  targetFT: number;
  opponentTag: string;
  opponentAvatar: string;
  opponentDiscordId: string;
  playerTeam: Team;
  opponentTeam: Team;
}

export interface Tournament {
  eventId: number;
  name: string;
  slug: string;
  image?: string;
  points: number;
  placement: number;
  placementLabel: string;
  isWinner: boolean;
}

export interface Profile {
  user: {
    discordId: string;
    username: string;
    globalName: string;
    guildNickname: string;
    avatarUrl: string;
  };
  stats: {
    points: number;
    wins: number;
    losses: number;
    rankingPosition: number;
    tournamentPoints?: number;
    tournamentPosition?: number;
  };
  rank: RankInfo;
  fights: Fight[];
  tournaments: Tournament[];
  mains: Team;
}

export interface MatchmakingPlayer {
  discordId: string;
  username: string;
  avatarUrl: string;
  points: number;
  wins: number;
  losses: number;
  streak: number;
  updatedAt: string;
  ranking: number;
}

export interface TournamentPlayer {
  id?: number;
  ranking: number;
  gamerTag: string;
  sponsor?: string;
  character?: string;
  avatarUrl?: string;
  discordId?: string;
  points: number;
}

export interface QueuePlayer {
  discordId: string;
  tag: string;
  avatarUrl: string;
  points: number;
  rank: RankInfo;
}

export interface QueueState {
  status: "idle" | "searching" | "found" | "confirmed" | "matched" | "failed";
  queue?: { ft: number; since: string; players: number; radius: number };
  proposal?: {
    id: number;
    ft: number;
    pointsAtStake: number;
    me: QueuePlayer;
    opponent: QueuePlayer;
    acceptedByMe: boolean;
    acceptedByOpponent: boolean;
    expiresAt: string;
  };
  match?: { id: number; threadId: string; threadUrl: string; web: boolean };
}

export interface Roster {
  characters: Character[];
  fuses: Character[];
}

function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    fights: profile.fights ?? [],
    tournaments: profile.tournaments ?? [],
    mains: profile.mains ?? emptyTeam(),
  };
}

function emptyTeam(): Team {
  const empty = { id: "", name: "" };
  return { point: empty, assist: empty, fuse: empty };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(data?.message || `Error ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getToken(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith("#token=")) {
    const token = decodeURIComponent(hash.slice("#token=".length));
    localStorage.setItem(TOKEN_KEY, token);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return token;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function loginUrl() {
  return `${API_URL}/api/auth/discord/login`;
}

export function rankIconUrl(iconPath: string) {
  return `${API_URL}/${iconPath.replace(/^\//, "")}`;
}

export function characterIconUrl(id: string) {
  return `${API_URL}/Personajes/file_${encodeURIComponent(id)}_0.png`;
}

export function fuseIconUrl(id: string) {
  return `${API_URL}/Fusion/file_${encodeURIComponent(id)}V.png`;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchProfile(): Promise<{ profile: Profile; authenticated: boolean }> {
  const token = getToken();
  if (token) {
    try {
      const profile = await request<Profile>("/api/auth/me", {
        headers: authHeaders(token),
        cache: "no-store",
      });
      return { profile: normalizeProfile(profile), authenticated: true };
    } catch {
      clearToken();
    }
  }

  const profile = await request<Profile>(
    `/api/users/profile/${encodeURIComponent(LYCAN_DISCORD_ID)}`,
    { cache: "no-store" },
  );
  return { profile: normalizeProfile(profile), authenticated: false };
}

export async function fetchRankings() {
  const [matchmaking, tournaments] = await Promise.all([
    request<MatchmakingPlayer[]>("/api/rankings/matchmaking"),
    request<TournamentPlayer[]>("/api/rankings/2xko"),
  ]);
  return { matchmaking, tournaments };
}

export function fetchRoster() {
  return request<Roster>("/api/game/roster");
}

export async function saveMains(team: Team) {
  const token = getToken();
  if (!token) throw new Error("Inicia sesión con Discord para guardar tu equipo.");
  await request("/api/auth/mains", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      char1: team.point.id,
      char2: team.assist.id,
      fuse: team.fuse.id,
    }),
  });
}

export async function getQueueState(): Promise<QueueState> {
  const token = getToken();
  if (!token) return { status: "idle" };
  return request<QueueState>("/api/matchmaking/queue/state", {
    headers: authHeaders(token),
    cache: "no-store",
  });
}

async function queueAction(path: string, body: Record<string, unknown> = {}) {
  const token = getToken();
  if (!token) throw new Error("Inicia sesión con Discord para usar el matchmaking.");
  await request(path, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export const joinQueue = () => queueAction("/api/matchmaking/queue/join", { ft: 3 });
export const leaveQueue = () => queueAction("/api/matchmaking/queue/leave");
export const acceptProposal = () => queueAction("/api/matchmaking/accept");
export const declineProposal = () => queueAction("/api/matchmaking/decline");
