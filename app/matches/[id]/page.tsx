import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import LastUpdatedBadge from "@/components/ui/LastUpdatedBadge";
import EmptyState from "@/components/ui/EmptyState";
import MatchImportanceBadge from "@/components/matches/MatchImportanceBadge";
import SpoilerScore from "@/components/matches/SpoilerScore";
import MatchTime from "@/components/matches/MatchTime";
import CalendarButton from "@/components/matches/CalendarButton";
import ReminderButton from "@/components/matches/ReminderButton";
import PredictionPoll from "@/components/matches/PredictionPoll";
import Timeline from "@/components/matches/Timeline";
import LiveStatsPanel from "@/components/matches/LiveStatsPanel";
import TeamComparisonPanel from "@/components/matches/TeamComparisonPanel";
import HeadToHeadPanel from "@/components/matches/HeadToHeadPanel";
import FanReactionPanel from "@/components/matches/FanReactionPanel";
import WatchSectionClient from "./WatchSectionClient";
import TeamBadge from "@/components/teams/TeamBadge";
import PlayerList from "@/components/players/PlayerList";
import { getFixture, getMatchCentre, getSquads, getStadium, getStandings, getTeams } from "@/services/sync/syncService";
import { sortGroup } from "@/services/normalizers/standings";

export const revalidate = 60;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card dark:bg-night-900 dark:shadow-card-dark">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default async function MatchDetailsPage({ params }: { params: { id: string } }) {
  const fixture = await getFixture(params.id);
  if (!fixture) notFound();

  const [stadium, teamsRes, squadsRes, standingsRes, centre] = await Promise.all([
    fixture.stadiumId ? getStadium(fixture.stadiumId) : Promise.resolve(null),
    getTeams(),
    getSquads(),
    getStandings(),
    getMatchCentre(fixture.id)
  ]);

  const teams = teamsRes.data ?? [];
  const home = teams.find((t) => t.id === fixture.homeTeamId) ?? null;
  const away = teams.find((t) => t.id === fixture.awayTeamId) ?? null;

  // Standings give the team-comparison table real, sourced numbers (record,
  // goals, form, group position) for group-stage matches.
  const standings = standingsRes.data ?? [];
  const homeStanding = standings.find((s) => s.teamId === fixture.homeTeamId) ?? null;
  const awayStanding = standings.find((s) => s.teamId === fixture.awayTeamId) ?? null;
  const positionIn = (s: typeof homeStanding) => {
    if (!s) return null;
    const ordered = sortGroup(standings.filter((row) => row.group === s.group));
    const idx = ordered.findIndex((row) => row.teamId === s.teamId);
    return idx >= 0 ? idx + 1 : null;
  };
  const homePosition = positionIn(homeStanding);
  const awayPosition = positionIn(awayStanding);

  const squads = squadsRes.data ?? [];
  const homeSquad = squads.filter((p) => p.teamId === fixture.homeTeamId);
  const awaySquad = squads.filter((p) => p.teamId === fixture.awayTeamId);
  const facts = centre?.facts ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-pitch-800 via-pitch-900 to-night-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={fixture.status === "live" ? "live" : fixture.status === "fulltime" ? "fulltime" : "upcoming"} pulse={fixture.status === "live"}>
            {fixture.status === "live" && fixture.minute !== null ? `Live ${fixture.minute}'` : fixture.status}
          </Badge>
          <MatchImportanceBadge label={fixture.importanceLabel} />
          {fixture.group ? <Badge variant="neutral">Group {fixture.group}</Badge> : <Badge variant="neutral">{fixture.round}</Badge>}
        </div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <TeamBadge name={fixture.homeTeamName} flag={home?.flag} size="lg" />
            <span className="font-display text-lg font-bold sm:text-2xl">{fixture.homeTeamName}</span>
          </div>
          <SpoilerScore fixture={fixture} large />
          <div className="flex flex-col items-center gap-2 text-center">
            <TeamBadge name={fixture.awayTeamName} flag={away?.flag} size="lg" />
            <span className="font-display text-lg font-bold sm:text-2xl">{fixture.awayTeamName}</span>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-pitch-100">
          <MatchTime isoUTC={fixture.dateTimeUTC} stadiumTimezone={stadium?.timezone} showAll />
          <div className="text-right text-sm">
            <p className="font-semibold text-white">{stadium?.name ?? "Venue TBC"}</p>
            {stadium && <p>{stadium.city}, {stadium.country}</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <ReminderButton fixture={fixture} />
          <CalendarButton fixture={fixture} stadium={stadium} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DataSourceBadge meta={fixture.sourceMeta} className="!text-pitch-200" />
          <LastUpdatedBadge iso={fixture.sourceMeta.fetchedAt} />
        </div>
      </section>

      <WatchSectionClient />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Live timeline">
          <Timeline events={centre?.timeline ?? []} />
        </Section>
        <Section title="Live match stats">
          <LiveStatsPanel stats={centre?.stats ?? null} />
        </Section>
        <Section title="Team comparison">
          <TeamComparisonPanel
            home={home}
            away={away}
            homeStanding={homeStanding}
            awayStanding={awayStanding}
            homePosition={homePosition}
            awayPosition={awayPosition}
          />
        </Section>
        <Section title="Head-to-head">
          <HeadToHeadPanel h2h={centre?.headToHead ?? null} />
        </Section>
      </div>

      <Section title="Match preview">
        <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:bg-night-800/60">
          Previews are generated only from available official data (fixtures, standings, team records). Nothing here is
          invented — sections stay empty until sourced data exists.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { h: "Why this match matters", body: fixture.importanceLabel ? `Official context labels this as: ${fixture.importanceLabel}.` : null },
            { h: "Key player to watch", body: [...homeSquad, ...awaySquad].find((p) => p.isKeyPlayer)?.name ?? null },
            { h: "Tactical battle", body: null },
            { h: "What each team needs", body: null },
            { h: "Possible turning point", body: null },
            { h: "Fun fact", body: facts[0]?.fact ?? null }
          ].map((s) => (
            <div key={s.h} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <h3 className="text-sm font-bold">{s.h}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {s.body ?? <span className="text-slate-400">Available once official data covers this.</span>}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={`${fixture.homeTeamName} squad`}>
          {home?.coach && <p className="mb-3 text-sm"><span className="font-semibold">Coach:</span> {home.coach}</p>}
          <PlayerList players={homeSquad} />
        </Section>
        <Section title={`${fixture.awayTeamName} squad`}>
          {away?.coach && <p className="mb-3 text-sm"><span className="font-semibold">Coach:</span> {away.coach}</p>}
          <PlayerList players={awaySquad} />
        </Section>
      </div>

      <Section title="Lineups">
        {centre?.lineupsConfirmed ? (
          <p className="text-sm">Confirmed lineups are available in the official match centre.</p>
        ) : (
          <EmptyState title="Lineups not announced" message="Probable and confirmed lineups appear here from official team sheets, usually ~1 hour before kickoff." icon="📋" />
        )}
      </Section>

      {fixture.status === "fulltime" && (
        <Section title="Highlights & player of the match">
          <div className="space-y-2 text-sm">
            {centre?.highlightsUrl ? (
              <a href={centre.highlightsUrl} target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline dark:text-pitch-400">▶ Official highlights ↗</a>
            ) : (
              <p className="text-slate-500">Official highlight links appear here after the match. We only link to official, licensed video sources.</p>
            )}
            {centre?.goalClipsUrl && (
              <a href={centre.goalClipsUrl} target="_blank" rel="noopener noreferrer" className="block text-pitch-600 hover:underline dark:text-pitch-400">⚽ Official goal clips ↗</a>
            )}
            <p><span className="font-semibold">Player of the match:</span> {centre?.playerOfTheMatch ?? "Announced by the official awards panel after the match."}</p>
          </div>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Your prediction">
          <PredictionPoll fixture={fixture} />
        </Section>
        <Section title="Fan reactions">
          <FanReactionPanel fixture={fixture} />
        </Section>
      </div>
    </div>
  );
}
