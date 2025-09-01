// src/pages/stats.ts

const statistiques: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `

    <div class="container-page my-10 space-y-6">
      <header class="rounded-2xl border bg-white shadow-sm px-6 py-5">
        <h1 class="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p class="text-sm text-gray-600">Overview of your statistics</p>
      </header>

<!-- ELO -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">ELO</div>
          <div class="mt-1 text-2xl font-semibold">1 482</div>
        </article>

<!-- % Victoire -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Win rate</div>
          <div class="mt-1 text-2xl font-semibold">67%</div>
        </article>

<!-- Total Match joués -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Matches played</div>
          <div class="mt-1 text-2xl font-semibold">72</div>
        </article>

<!-- Serie de victoire -->
        <article class="rounded-2xl border bg-white shadow-sm p-5">
          <div class="text-sm text-gray-600">Current streak</div>
          <div class="mt-1 text-2xl font-semibold">4 wins</div>
        </article>
      </section>


<!-- Tableau Match Récents -->
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
            <tbody class="divide-y divide-gray-100">




<!-- Exemple, a changer avec des vrai stats api -->
              <tr>
                <td class="py-2 pr-4 font-medium">Nora</td>
                <td class="py-2 pr-4">11–8</td>
                <td class="py-2 pr-4"><span class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Win</span></td>
                <td class="py-2">12/08/2025</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-medium">Maya</td>
                <td class="py-2 pr-4">9–11</td>
                <td class="py-2 pr-4"><span class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Defeat</span></td>
                <td class="py-2">10/08/2025</td>
              </tr>
              <tr>
                <td class="py-2 pr-4 font-medium">Luca</td>
                <td class="py-2 pr-4">11–6</td>
                <td class="py-2 pr-4"><span class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Win</span></td>
                <td class="py-2">08/08/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  `;
};

export default statistiques;
