import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  acceptProposal,
  characterIconUrl,
  declineProposal,
  fetchProfile,
  fetchRankings,
  fetchRoster,
  fuseIconUrl,
  getQueueState,
  joinQueue,
  leaveQueue,
  loginUrl,
  rankIconUrl,
  saveMains,
  type Character,
  type MatchmakingPlayer,
  type Profile,
  type QueueState,
  type Roster,
  type Team,
  type TournamentPlayer,
} from "./lib/api";

type IconName =
  | "bolt"
  | "chevron"
  | "copy"
  | "discord"
  | "flame"
  | "gamepad"
  | "grid"
  | "history"
  | "rank"
  | "search"
  | "settings"
  | "shield"
  | "swords"
  | "trophy"
  | "users";

const icons: Record<IconName, ReactNode> = {
  bolt: <path d="m13 2-8 11h7l-1 9 8-12h-7l1-8Z" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
    </>
  ),
  discord: (
    <>
      <path d="M7.5 6.8A12 12 0 0 1 12 6c1.6 0 3.1.3 4.5.8 1.2 1.7 2 3.8 2.2 6-.9 1.2-2 2-3.2 2.6l-.8-1.1c.7-.3 1.3-.7 1.8-1.2-2.8 1.3-6.2 1.3-9 0 .6.5 1.2.9 1.8 1.2l-.8 1.1A10.7 10.7 0 0 1 5.3 13c.2-2.3 1-4.4 2.2-6.2Z" />
      <path d="M9.5 11.3h.01M14.5 11.3h.01" />
    </>
  ),
  flame: (
    <path d="M12 22a7 7 0 0 0 7-7c0-4-2.2-7.4-6.5-12 .3 3.2-1.6 5-3.1 6.5C8 11 7 12.4 7 15a5 5 0 0 0 5 5c1.7 0 3-1.3 3-3 0-1.8-1-3.4-3-5 .2 1.5-.6 2.3-1.2 3-.5.5-.8 1-.8 1.8" />
  ),
  gamepad: (
    <>
      <path d="M8 8h8a5 5 0 0 1 4.8 6.5l-1 3.1a2 2 0 0 1-3.3.8l-1.9-1.7H9.4l-1.9 1.7a2 2 0 0 1-3.3-.8l-1-3.1A5 5 0 0 1 8 8Z" />
      <path d="M7 12v3M5.5 13.5h3M16 12.5h.01M18 14.5h.01" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  rank: (
    <>
      <path d="M12 3 4 7v5c0 4.7 3.4 8 8 9 4.6-1 8-4.3 8-9V7l-8-4Z" />
      <path d="m9.5 12 1.6 1.6 3.7-4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: <path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z" />,
  swords: (
    <>
      <path d="m14.5 17.5-8-8L3 6V3h3l3.5 3.5 8 8M13 19l6-6M16 16l5 5M20 20l1-1M6.5 14.5 3 18l3 3 3.5-3.5M4 20l1 1M14.5 6.5 18 3h3v3l-3.5 3.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM12 13v5M8 21h8M10 18h4" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {icons[name]}
    </svg>
  );
}

const localCharacterArt: Record<string, string> = {
  Ahri: "/assets/ahri.jpg",
  Ekko: "/assets/ekko.jpg",
  Warwick: "/assets/warwick.jpg",
  Yasuo: "/assets/yasuo.png",
};

const characterArt = (id: string) => localCharacterArt[id] || characterIconUrl(id);

const displayName = (profile: Profile) =>
  profile.user.guildNickname || profile.user.globalName || profile.user.username || "Jugador";

const relativeDate = (iso: string) => {
  const date = new Date(iso);
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 1) return "AHORA";
  if (hours < 24) return `HACE ${hours} H`;
  if (hours < 48) return "AYER";
  return date.toLocaleDateString("es", { day: "numeric", month: "short" }).toUpperCase();
};

const validTeam = (team?: Team) => Boolean(team?.point.id && team?.assist.id);

function RankingBoard({
  matchmaking,
  tournaments,
}: {
  matchmaking: MatchmakingPlayer[];
  tournaments: TournamentPlayer[];
}) {
  const [mode, setMode] = useState<"matchmaking" | "tournaments">("matchmaking");
  const rows =
    mode === "matchmaking"
      ? matchmaking.map((player) => ({
          id: player.discordId,
          rank: player.ranking,
          name: player.username,
          avatar: player.avatarUrl,
          detail: `${player.wins}V · ${player.losses}D`,
          points: player.points + 1000,
        }))
      : tournaments.map((player) => ({
          id: player.discordId || String(player.id),
          rank: player.ranking,
          name: player.gamerTag,
          avatar: player.avatarUrl,
          detail: player.character || player.sponsor || "Competidor 2XKO",
          points: player.points,
        }));

  return (
    <section className="ranking-board panel">
      <div className="ranking-toolbar">
        <div>
          <span className="eyebrow">CLASIFICACIÓN EN VIVO</span>
          <h2>RANKING DE LA COMUNIDAD</h2>
        </div>
        <div className="segmented">
          <button
            className={mode === "matchmaking" ? "active" : ""}
            onClick={() => setMode("matchmaking")}
            type="button"
          >
            MATCHMAKING
          </button>
          <button
            className={mode === "tournaments" ? "active" : ""}
            onClick={() => setMode("tournaments")}
            type="button"
          >
            TORNEOS
          </button>
        </div>
      </div>
      <div className="ranking-labels">
        <span>POS.</span>
        <span>JUGADOR</span>
        <span>RENDIMIENTO</span>
        <span>PUNTOS</span>
      </div>
      <div className="ranking-rows">
        {rows.map((row) => (
          <div
            className={row.rank <= 3 ? `ranking-row podium podium-${row.rank}` : "ranking-row"}
            key={row.id}
          >
            <strong className="ranking-position">#{String(row.rank).padStart(2, "0")}</strong>
            <div className="ranking-player">
              {row.avatar ? (
                <img alt="" src={row.avatar} />
              ) : (
                <span>{row.name.slice(0, 1).toUpperCase()}</span>
              )}
              <strong>{row.name}</strong>
            </div>
            <span>{row.detail}</span>
            <strong className="ranking-points">{row.points.toLocaleString("es")} PTS</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState<"Inicio" | "Ranking" | "Matchmaking">("Inicio");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [rankings, setRankings] = useState<{
    matchmaking: MatchmakingPlayer[];
    tournaments: TournamentPlayer[];
  }>({ matchmaking: [], tournaments: [] });
  const [roster, setRoster] = useState<Roster>({ characters: [], fuses: [] });
  const [team, setTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teamBusy, setTeamBusy] = useState(false);
  const [queue, setQueue] = useState<QueueState>({ status: "idle" });
  const [queueBusy, setQueueBusy] = useState(false);
  const [historyMode, setHistoryMode] = useState<"fights" | "tournaments">("fights");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const refreshQueue = async () => {
    try {
      setQueue(await getQueueState());
    } catch (queueError) {
      notify(queueError instanceof Error ? queueError.message : "No se pudo consultar la cola.");
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetchProfile(), fetchRankings(), fetchRoster()])
      .then(([profileData, rankingData, rosterData]) => {
        if (!active) return;
        setProfile(profileData.profile);
        setAuthenticated(profileData.authenticated);
        setRankings(rankingData);
        setRoster(rosterData);
        const recentTeam = profileData.profile.fights.find((fight) =>
          validTeam(fight.playerTeam),
        )?.playerTeam;
        const defaultFuse =
          rosterData.fuses.find((fuse) => fuse.id === "2XAssist") || rosterData.fuses[0];
        setTeam(
          validTeam(profileData.profile.mains)
            ? profileData.profile.mains
            : recentTeam || {
                point: rosterData.characters.find((character) => character.id === "Ekko")!,
                assist: rosterData.characters.find((character) => character.id === "Warwick")!,
                fuse: defaultFuse,
              },
        );
        setLoading(false);
        if (profileData.authenticated) void refreshQueue();
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError instanceof Error ? loadError.message : "No se pudo conectar con la API.",
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const interval = window.setInterval(() => void refreshQueue(), 8_000);
    return () => window.clearInterval(interval);
  }, [authenticated]);

  const name = profile ? displayName(profile) : "Lycan";
  const games = profile ? profile.stats.wins + profile.stats.losses : 0;
  const winRate = games && profile ? Math.round((profile.stats.wins / games) * 100) : 0;
  const mmPlayer = profile
    ? rankings.matchmaking.find((player) => player.discordId === profile.user.discordId)
    : undefined;
  const progress = profile
    ? Math.round(
        Math.min(
          1,
          profile.rank.progress > 1 ? profile.rank.progress / 100 : profile.rank.progress,
        ) * 100,
      )
    : 0;
  const visibleFights = profile?.fights.slice(0, showAll ? undefined : 3) ?? [];
  const visibleTournaments = profile?.tournaments.slice(0, showAll ? undefined : 3) ?? [];
  const selectedCharacters = team ? [team.point, team.assist] : [];

  const changeCharacter = (character: Character) => {
    if (!team || selectedCharacters.some((item) => item.id === character.id)) return;
    setTeam({ ...team, point: team.assist, assist: character });
  };

  const handleTeamAction = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (!authenticated) {
      notify("Inicia sesión con Discord para guardar tu equipo.");
      window.setTimeout(() => (window.location.href = loginUrl()), 900);
      return;
    }
    if (!team) return;
    setTeamBusy(true);
    try {
      await saveMains(team);
      setIsEditing(false);
      notify("Equipo principal guardado.");
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : "No se pudo guardar el equipo.");
    } finally {
      setTeamBusy(false);
    }
  };

  const handleQueue = async () => {
    if (!authenticated) {
      window.location.href = loginUrl();
      return;
    }
    setQueueBusy(true);
    try {
      if (queue.status === "searching") await leaveQueue();
      else await joinQueue();
      await refreshQueue();
    } catch (queueError) {
      notify(queueError instanceof Error ? queueError.message : "No se pudo actualizar la cola.");
    } finally {
      setQueueBusy(false);
    }
  };

  const proposalAction = async (accept: boolean) => {
    setQueueBusy(true);
    try {
      if (accept) await acceptProposal();
      else await declineProposal();
      await refreshQueue();
    } catch (queueError) {
      notify(
        queueError instanceof Error ? queueError.message : "No se pudo responder la propuesta.",
      );
    } finally {
      setQueueBusy(false);
    }
  };

  const copyTag = async () => {
    if (!profile) return;
    await navigator.clipboard?.writeText(`@${profile.user.username}`);
    notify("Discord copiado al portapapeles.");
  };

  const navigate = (destination: "Inicio" | "Ranking" | "Matchmaking") => {
    setActiveNav(destination);
    if (destination === "Matchmaking") {
      window.setTimeout(
        () => document.querySelector(".discord-card")?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="app-shell center-state">
        <span className="loader-mark">
          <Icon name="flame" size={27} />
        </span>
        <strong>CARGANDO PERFIL COMPETITIVO</strong>
        <small>Conectando con Hot Coffee API...</small>
      </div>
    );
  }

  if (error || !profile || !team) {
    return (
      <div className="app-shell center-state error-state">
        <Icon name="history" size={34} />
        <strong>NO PUDIMOS CARGAR LOS DATOS</strong>
        <p>{error || "La API no devolvió un perfil válido."}</p>
        <button onClick={() => window.location.reload()} type="button">
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("Inicio")} type="button">
          <span className="brand-mark">
            <Icon name="flame" size={22} />
          </span>
          <span className="brand-copy">
            <strong>HOT COFFEE</strong>
            <small>2XKO COMMUNITY</small>
          </span>
        </button>
        <nav aria-label="Navegación principal">
          {[
            ["Inicio", "grid"],
            ["Ranking", "trophy"],
            ["Matchmaking", "swords"],
          ].map(([label, icon]) => (
            <button
              className={activeNav === label ? "active" : ""}
              key={label}
              onClick={() => navigate(label as "Inicio" | "Ranking" | "Matchmaking")}
              type="button"
            >
              <Icon name={icon as IconName} size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          {!authenticated && (
            <button
              className="login-button"
              onClick={() => (window.location.href = loginUrl())}
              type="button"
            >
              <Icon name="discord" size={16} /> INICIAR SESIÓN
            </button>
          )}
          <button className="profile-chip" onClick={() => navigate("Inicio")} type="button">
            <img alt="" src={profile.user.avatarUrl || "/assets/lycan-logo.png"} />
            <span>
              <small>{authenticated ? "MI PERFIL" : "PERFIL PÚBLICO"}</small>
              <strong>{name}</strong>
            </span>
            <Icon name="chevron" size={15} />
          </button>
        </div>
      </header>

      <main>
        <section className="page-intro">
          <div>
            <span className="eyebrow">
              {activeNav === "Ranking" ? "DATOS EN TIEMPO REAL" : "PERFIL COMPETITIVO"} <i /> HOT
              COFFEE API
            </span>
            <h1>
              {activeNav === "Ranking" ? (
                <>
                  DOMINA LA <em>CLASIFICACIÓN.</em>
                </>
              ) : (
                <>
                  BUENAS, <em>{name.toUpperCase()}.</em>
                </>
              )}
            </h1>
            <p>
              {activeNav === "Ranking"
                ? "Matchmaking y resultados de torneos actualizados desde la comunidad."
                : "Tu progreso, tus rivales y el próximo combate. Datos sincronizados con el servidor."}
            </p>
          </div>
          <div className="season-status">
            <span>ESTADO DEL SERVIDOR</span>
            <strong>HOT COFFEE ONLINE</strong>
            <small>
              <i /> DATOS CONECTADOS
            </small>
          </div>
        </section>

        {activeNav === "Ranking" ? (
          <RankingBoard matchmaking={rankings.matchmaking} tournaments={rankings.tournaments} />
        ) : (
          <>
            <section className="dashboard">
              <article className="rank-card panel">
                <div className="rank-card-art" aria-hidden="true" />
                <div className="rank-card-top">
                  <span className="online">
                    <i /> {authenticated ? "SESIÓN ACTIVA" : "PERFIL PÚBLICO"}
                  </span>
                  <span className="live-badge">LIVE</span>
                </div>
                <div className="rank-content">
                  <div
                    className="rank-emblem api-emblem"
                    aria-label={`Rango ${profile.rank.displayName}`}
                  >
                    <img
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src = "/assets/hot-coffee.jpg";
                      }}
                      src={rankIconUrl(profile.rank.iconPath)}
                    />
                  </div>
                  <div className="rank-copy">
                    <span>RANGO ACTUAL</span>
                    <h2>{profile.rank.displayName.toUpperCase()}</h2>
                    <div className="league-points">
                      <strong>{profile.rank.isRp ? profile.rank.rp : profile.rank.lp}</strong>{" "}
                      {profile.rank.isRp ? "RP" : "LP"} <i /> #
                      {String(profile.stats.rankingPosition).padStart(2, "0")}
                    </div>
                    <div className="progress-head">
                      <small>PROGRESO DE DIVISIÓN</small>
                      <b>{progress}%</b>
                    </div>
                    <div className="progress-bar">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <p>
                      {profile.rank.next ? (
                        <>
                          Faltan{" "}
                          <strong>
                            {profile.rank.lpToNext} {profile.rank.isRp ? "RP" : "LP"}
                          </strong>{" "}
                          para {profile.rank.next}
                        </>
                      ) : (
                        <strong>RANGO MÁXIMO ALCANZADO</strong>
                      )}
                    </p>
                  </div>
                </div>
                <div className="rank-stats">
                  <div>
                    <span>VICTORIAS</span>
                    <strong>{String(profile.stats.wins).padStart(2, "0")}</strong>
                    <small>sets confirmados</small>
                  </div>
                  <div>
                    <span>DERROTAS</span>
                    <strong>{String(profile.stats.losses).padStart(2, "0")}</strong>
                    <small>{games} sets jugados</small>
                  </div>
                  <div>
                    <span>WIN RATE</span>
                    <strong className="gold">{winRate}%</strong>
                    <small>rendimiento total</small>
                  </div>
                </div>
              </article>

              <div className="middle-column">
                <div className="metric-grid">
                  <article className="metric panel">
                    <span className="metric-icon gold-bg">
                      <Icon name="bolt" size={18} />
                    </span>
                    <div>
                      <small>PUNTOS DE LIGA</small>
                      <strong>{profile.stats.points.toLocaleString("es")}</strong>
                      <p>ranking de matchmaking</p>
                    </div>
                    <span className="trend">LIVE</span>
                  </article>
                  <article className="metric panel">
                    <span className="metric-icon orange-bg">
                      <Icon name="trophy" size={18} />
                    </span>
                    <div>
                      <small>POSICIÓN GLOBAL</small>
                      <strong>#{String(profile.stats.rankingPosition).padStart(2, "0")}</strong>
                      <p>de {rankings.matchmaking.length} jugadores</p>
                    </div>
                    <span className="trend neutral">—</span>
                  </article>
                </div>

                <article className="team-card panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">EQUIPO PRINCIPAL</span>
                      <h3>
                        {team.point.name.toUpperCase()} / {team.assist.name.toUpperCase()}
                      </h3>
                    </div>
                    <button
                      className={isEditing ? "active" : ""}
                      disabled={teamBusy}
                      onClick={handleTeamAction}
                      type="button"
                    >
                      {teamBusy ? "GUARDANDO..." : isEditing ? "GUARDAR EQUIPO" : "EDITAR EQUIPO"}
                    </button>
                  </div>
                  <div className="team-body">
                    <div className="fighter-stack">
                      {[team.point, team.assist].map((fighter, index) => (
                        <div className="fighter-card" key={`${fighter.id}-${index}`}>
                          <img alt={fighter.name} src={characterArt(fighter.id)} />
                          <span>{index === 0 ? "POINT" : "ASSIST"}</span>
                          <strong>{fighter.name}</strong>
                        </div>
                      ))}
                      <div className="synergy">
                        {team.fuse.id ? (
                          <img alt="" src={fuseIconUrl(team.fuse.id)} />
                        ) : (
                          <Icon name="bolt" size={20} />
                        )}
                        <span>FUSIÓN</span>
                        <strong>{team.fuse.name ? "ON" : "—"}</strong>
                      </div>
                    </div>
                    <div className="team-summary">
                      <span>FUSIÓN SELECCIONADA</span>
                      <strong>{team.fuse.name || "Sin configurar"}</strong>
                      <p>
                        Equipo sincronizado con el perfil y utilizado como selección rápida para tus
                        próximos sets.
                      </p>
                      <div className="traits">
                        <span>{team.point.name}</span>
                        <span>{team.assist.name}</span>
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="fighter-picker">
                      <span>ELIGE 2 LUCHADORES · LA SIGUIENTE SELECCIÓN REEMPLAZA AL POINT</span>
                      <div>
                        {roster.characters.map((fighter) => (
                          <button
                            className={
                              selectedCharacters.some((item) => item.id === fighter.id)
                                ? "selected"
                                : ""
                            }
                            key={fighter.id}
                            onClick={() => changeCharacter(fighter)}
                            type="button"
                          >
                            <img alt="" src={characterArt(fighter.id)} />
                            <strong>{fighter.name}</strong>
                            <small>2XKO</small>
                          </button>
                        ))}
                      </div>
                      <label className="fuse-select">
                        FUSIÓN
                        <select
                          onChange={(event) => {
                            const fuse = roster.fuses.find(
                              (item) => item.id === event.target.value,
                            );
                            if (fuse) setTeam({ ...team, fuse });
                          }}
                          value={team.fuse.id}
                        >
                          {roster.fuses.map((fuse) => (
                            <option key={fuse.id} value={fuse.id}>
                              {fuse.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </article>
              </div>

              <aside className="side-column">
                <article className="discord-card panel">
                  <div className="panel-heading compact">
                    <div>
                      <span className="eyebrow">
                        {authenticated ? "CUENTA VINCULADA" : "VISTA PÚBLICA"}
                      </span>
                      <h3>DISCORD</h3>
                    </div>
                    <Icon name="discord" size={21} />
                  </div>
                  <div className="discord-user">
                    <div className="avatar-wrap">
                      <img alt={name} src={profile.user.avatarUrl || "/assets/lycan-logo.png"} />
                      <i />
                    </div>
                    <div>
                      <strong>{name}</strong>
                      <span>@{profile.user.username}</span>
                    </div>
                    <button aria-label="Copiar usuario" onClick={copyTag} type="button">
                      <Icon name="copy" size={16} />
                    </button>
                  </div>
                  <div className="discord-stats">
                    <div>
                      <span>SETS</span>
                      <strong>{games}</strong>
                    </div>
                    <div>
                      <span>WIN RATE</span>
                      <strong>{winRate}%</strong>
                    </div>
                    <div>
                      <span>RACHA</span>
                      <strong className="gold">
                        {mmPlayer?.streak ? `W${mmPlayer.streak}` : "—"}
                      </strong>
                    </div>
                  </div>

                  {queue.status === "found" && queue.proposal ? (
                    <div className="proposal-box">
                      <span>RIVAL ENCONTRADO</span>
                      <div>
                        <img alt="" src={queue.proposal.opponent.avatarUrl} />
                        <strong>{queue.proposal.opponent.tag}</strong>
                        <small>
                          {queue.proposal.opponent.rank.displayName} ·{" "}
                          {queue.proposal.pointsAtStake} PTS
                        </small>
                      </div>
                      <div className="proposal-actions">
                        <button
                          disabled={queueBusy || queue.proposal.acceptedByMe}
                          onClick={() => proposalAction(true)}
                          type="button"
                        >
                          {queue.proposal.acceptedByMe ? "ESPERANDO RIVAL" : "ACEPTAR"}
                        </button>
                        <button
                          disabled={queueBusy}
                          onClick={() => proposalAction(false)}
                          type="button"
                        >
                          RECHAZAR
                        </button>
                      </div>
                    </div>
                  ) : queue.status === "matched" && queue.match ? (
                    <button
                      className="match-button"
                      onClick={() =>
                        queue.match?.threadUrl
                          ? window.open(queue.match.threadUrl, "_blank")
                          : notify("Tu set web ya está listo.")
                      }
                      type="button"
                    >
                      <Icon name="swords" size={19} /> ABRIR SET #{queue.match.id}
                    </button>
                  ) : (
                    <button
                      className={`match-button ${queue.status === "searching" ? "searching" : ""}`}
                      disabled={queueBusy || queue.status === "confirmed"}
                      onClick={handleQueue}
                      type="button"
                    >
                      {queueBusy || queue.status === "searching" ? (
                        <span className="spinner" />
                      ) : (
                        <Icon name={authenticated ? "gamepad" : "discord"} size={19} />
                      )}
                      {!authenticated
                        ? "CONECTAR DISCORD"
                        : queue.status === "searching"
                          ? "CANCELAR BÚSQUEDA"
                          : queue.status === "confirmed"
                            ? "CREANDO PARTIDA..."
                            : "BUSCAR PARTIDA"}
                    </button>
                  )}
                  <p className="queue-note">
                    <i className={queue.status === "searching" ? "pulse" : ""} />
                    {queue.status === "searching"
                      ? `${queue.queue?.players ?? 1} en cola · FT${queue.queue?.ft ?? 3}`
                      : authenticated
                        ? "Emparejamiento por rango · FT3"
                        : "Necesitas iniciar sesión para jugar"}
                  </p>
                </article>

                <article className="streak-card panel">
                  <span className="streak-icon">
                    <Icon name="trophy" size={23} />
                  </span>
                  <div>
                    <small>CARRERA DE TORNEOS</small>
                    <strong>{profile.stats.tournamentPoints ?? 0} puntos</strong>
                    <p>Posición #{profile.stats.tournamentPosition || "—"}</p>
                  </div>
                  <div className="tournament-mini">
                    <span>{profile.tournaments.length}</span> TORNEOS ·{" "}
                    <span>{profile.tournaments.filter((item) => item.isWinner).length}</span>{" "}
                    TÍTULOS
                  </div>
                </article>
              </aside>
            </section>

            <section className="activity panel">
              <div className="panel-heading activity-heading">
                <div>
                  <span className="eyebrow">HISTORIAL SINCRONIZADO</span>
                  <h3>{historyMode === "fights" ? "COMBATES RECIENTES" : "CARRERA DE TORNEOS"}</h3>
                </div>
                <div className="activity-actions">
                  <button
                    className={historyMode === "fights" ? "active" : ""}
                    onClick={() => {
                      setHistoryMode("fights");
                      setShowAll(false);
                    }}
                    type="button"
                  >
                    SETS
                  </button>
                  <button
                    className={historyMode === "tournaments" ? "active" : ""}
                    onClick={() => {
                      setHistoryMode("tournaments");
                      setShowAll(false);
                    }}
                    type="button"
                  >
                    TORNEOS
                  </button>
                  <button onClick={() => setShowAll((value) => !value)} type="button">
                    {showAll ? "VER MENOS" : "VER TODO"}
                  </button>
                </div>
              </div>
              {historyMode === "fights" ? (
                <div className={`match-list ${showAll ? "expanded" : ""}`}>
                  {visibleFights.map((fight, index) => (
                    <div className="match-row" key={fight.id}>
                      <span className={`result-index ${fight.result === "LOSS" ? "loss" : ""}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="result-copy">
                        <strong className={fight.result === "LOSS" ? "loss-text" : ""}>
                          {fight.result === "WIN" ? "Victoria" : "Derrota"}
                        </strong>
                        <span>RANKED · FT{fight.targetFT}</span>
                      </div>
                      <div className="opponent">
                        <span>VS</span>
                        {fight.opponentAvatar ? (
                          <img className="mini-avatar image" alt="" src={fight.opponentAvatar} />
                        ) : (
                          <div className="mini-avatar">{fight.opponentTag.slice(0, 1)}</div>
                        )}
                        <div>
                          <strong>{fight.opponentTag}</strong>
                          <small>
                            {fight.playerTeam.point.name || "Equipo no registrado"} ·{" "}
                            {fight.playerTeam.assist.name}
                          </small>
                        </div>
                      </div>
                      <strong className="score">
                        {fight.scoreFor} — {fight.scoreAgainst}
                      </strong>
                      <span className="match-time">{relativeDate(fight.playedAt)}</span>
                      <button aria-label={`Ver perfil de ${fight.opponentTag}`} type="button">
                        <Icon name="chevron" size={16} />
                      </button>
                    </div>
                  ))}
                  {!visibleFights.length && (
                    <p className="empty-state">Aún no hay combates registrados.</p>
                  )}
                </div>
              ) : (
                <div className={`tournament-list ${showAll ? "expanded" : ""}`}>
                  {visibleTournaments.map((tournament) => (
                    <a
                      href={`https://www.start.gg/tournament/${tournament.slug}`}
                      key={tournament.eventId}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span
                        className={
                          tournament.isWinner ? "tournament-badge winner" : "tournament-badge"
                        }
                      >
                        <Icon name="trophy" size={18} />
                      </span>
                      <div>
                        <strong>{tournament.name}</strong>
                        <small>{tournament.placementLabel}</small>
                      </div>
                      <b>+{tournament.points} PTS</b>
                      <Icon name="chevron" size={16} />
                    </a>
                  ))}
                  {!visibleTournaments.length && (
                    <p className="empty-state">Aún no hay torneos registrados.</p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
