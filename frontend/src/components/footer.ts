export function createFooter() {
  const footer = document.createElement('div');
  footer.className = 'bg-black text-gray-200 border-t border-white/10';
  footer.innerHTML = `
    <div class="container-page py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img src="/site/logo.png" alt="Logo" class="h-7 w-7 rounded-lg ring-1 ring-white/10">
          <span class="text-sm text-gray-400">©2025 Pong</span>
        </div>

        <nav class="flex items-center gap-6" aria-label="Liens de pied de page">
          <a class="text-sm hover:text-white transition">Pong | 42 School Project</a>
        </nav>
      </div>
    </div>
  `;
  return footer;
}
