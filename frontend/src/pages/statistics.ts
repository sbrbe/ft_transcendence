import { navigateTo } from "../router/router";
import { getSavedUser } from "../utils/ui";
import { AppUser } from "../utils/interface";
import { getMatchHistory, getTournaments } from "../api/statistics";
import { setStatusMessage } from "../utils/ui";

const statistics: (container: HTMLElement) => void = (container) => {
  const saved = getSavedUser<AppUser>();
    if (!saved) {
      navigateTo('/connection');
      return;
    }
  container.innerHTML = `

    <div class="container-page my-10 space-y-6">
      <header class="rounded-2xl border bg-white shadow-sm px-6 py-5">
        <h1 class="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p class="text-sm text-gray-600">Overview of your statistics</p>
      </header>

<!-- WINRATE -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">WINRATE</div>
          <div id="winrate" class="mt-1 text-2xl font-semibold">_</div>
        </article>

<!-- WINS -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Wins</div>
          <div id="wins" class="mt-1 text-2xl font-semibold">_</div>
        </article>

<!-- DEFEATS -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Defeats</div>
          <div id="defeats" class="mt-1 text-2xl font-semibold">_</div>
        </article>

<!-- TOTAL -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Total</div>
          <div id="total" class="mt-1 text-2xl font-semibold">_</div>
        </article>
      </section>


<!-- MATCH HISTORY -->
      <section class="rounded-2xl border bg-white shadow-sm p-5">
        <h2 class="text-sm uppercase tracking-wider text-gray-500">Recent matches</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="py-2 pr-4">Opponent</th>
                <th class="py-2 pr-4">Score</th>
                <th class="py-2 pr-4">Result</th>
                <th class="py-2">Date</th>
              </tr>
            </thead>
            <tbody class="history divide-y divide-gray-100">
              <tr class="text-gray-400"><td class="py-3" colspan="4">No match history</td></tr>
            </tbody>
          </table>
        </div>
      </section>

<!-- TOURNAMENT HISTORY -->
      <section class="rounded-2xl border bg-white shadow-sm p-5">
        <h2 class="text-sm uppercase tracking-wider text-gray-500">Recent tournaments</h2>
        <div class="mt-4 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500">
                <th class="py-2 pr-4">Players</th>
                <th class="py-2 pr-4">Link to blockchain</th>
                <th class="py-2">Date</th>
              </tr>
            </thead>
            <tbody class="tournament divide-y divide-gray-100">
              <tr class="text-gray-400"><td class="py-3" colspan="4">No tournament history</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <p id="stats-msg" class="hidden text-sm text-red-600"></p>
    </div>
  `;
  
  loadStats(saved);
  loadTournament(saved);

  const msg = container.querySelector<HTMLParagraphElement>('#stats-msg')!;
  const tbodyMatches = container.querySelector<HTMLTableSectionElement>('tbody.history')!;
  const tbodyTournament = container.querySelector<HTMLTableSectionElement>('tbody.tournament')!;



  async function loadStats(saved: AppUser) {
      try {
        const userId = saved.userId;
        const history = await getMatchHistory(userId);

        const wins = history.wins ?? 0;
        const defeats = history.losses ?? 0;
        const total = wins + defeats;
        const winrate = total ? (wins / total) * 100 : 0;

        const elWins = container.querySelector<HTMLElement>('#wins');
        if (elWins)
            elWins.textContent = String(wins);
        const elDefeats = container.querySelector<HTMLElement>('#defeats');
        if (elDefeats)
            elDefeats.textContent = String(defeats);
        const elTotal = container.querySelector<HTMLElement>('#total');
        if (elTotal)
            elTotal.textContent = String(total);
        const elWinrate = container.querySelector<HTMLElement>('#winrate');
        if (elWinrate)
            elWinrate.textContent = `${winrate}%`;

        if (tbodyMatches) {
          tbodyMatches.innerHTML = "";
          const rows = Array.isArray(history.history) ? history.history.slice(0, 10) : [];

          if (!rows.length) {
           tbodyMatches.innerHTML = `<tr class="text-gray-400"><td class="py-3" colspan="4">No recent matches.</td></tr>`;
          } else {
          for (const m of rows) {
            const tr = document.createElement('tr');
            const date = m.date;
            const isWin = m.result === 'win';

            const myScore = isWin ? m.winnerScore : m.loserScore;
            const hisScore = isWin ? m.loserScore : m.winnerScore;

            tr.innerHTML = `
              <td class="py-2 pr-4">${m.opponent}</td>
              <td class="py-2 pr-4 font-medium">${hisScore} – ${myScore}</td>
              <td class="py-2">
                <span class="inline-flex items-center gap-1 text-xs ${isWin ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"} px-2 py-0.5 rounded-full">
                <span class="h-2 w-2 rounded-full ${isWin ? "bg-green-500" : "bg-red-400"}"></span>
                  ${isWin ? "Win" : "Defeat"}
                </span>
              </td>
              <td class="py-2 pr-4 whitespace-nowrap">${date}</td>
            `;
            tbodyMatches.appendChild(tr);
            }
          }
        }
        } catch (error: any) {
          setStatusMessage(msg, error?.message || "Can't load player stats", 'error');
          tbodyMatches.innerHTML = `<li class="text-sm text-gray-500">-</li>`;
        }
  }

  async function loadTournament(saved: AppUser) {
    const userId = saved.userId;
      try {
        const userId = saved.userId;
        const history = await getTournaments(userId);

        if (tbodyTournament) {
          tbodyTournament.innerHTML = "";
          const rows = Array.isArray(history.history) ? history.history.slice(0, 10) : [];

          if (!rows.length) {
           tbodyTournament.innerHTML = `<tr class="text-gray-400"><td class="py-3" colspan="4">No recent tournament.</td></tr>`;
          } else {
          for (const m of rows) {
            const tr = document.createElement('tr');
            const players = Array.isArray(m.players) ? m.players.filter(Boolean).join(', ') : String(m.players ?? '');
          const href = typeof m.snowtraceLink === 'string' ? m.snowtraceLink : '';
            tr.innerHTML = `
              <td class="py-2 pr-4">${players}</td>
              <td class="py-2 pr-4">
                <a href="${encodeURI(href)}" target="_blank" rel="noopener noreferrer"
                class="text-blue-600 hover:underline">View on Snowtrace</a>
              </td>
              <td class="py-2 pr-4 whitespace-nowrap">${m.date}</td>
            `;
            tbodyTournament.appendChild(tr);
            }
          }
        }
        } catch (error: any) {
          setStatusMessage(msg, error?.message || "Can't load player stats", 'error');
          tbodyTournament.innerHTML = `<li class="text-sm text-gray-500">-</li>`;
        }
  }
};

export default statistics;
