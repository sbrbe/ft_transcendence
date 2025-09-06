import { ensurePongLayout } from "./layout";

export function showMobileControls(container: HTMLElement) {
  ensurePongLayout(container);
  const ui = container.querySelector("#ui-layer") as HTMLElement;
  if (!ui.querySelector("#mobile-controls")) {
    ui.insertAdjacentHTML(
      "beforeend",
      `
      <div id="mobile-controls" class="flex gap-4">
        <button id="btn-up"   class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬆️</button>
        <button id="btn-down" class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬇️</button>
      </div>
      `
    );
  }
}

export function hideMobileControls(container: HTMLElement) {
  const el = container.querySelector("#mobile-controls");
  if (el) el.remove();
}