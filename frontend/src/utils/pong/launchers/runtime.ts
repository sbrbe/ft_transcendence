export interface Disposable { dispose(): void }

class GameRuntime {
  private current: Disposable | null = null;
  private disconnectDomWatch?: () => void;
  private abortCtrl?: AbortController;

  start(instance: Disposable, mount: HTMLElement) {
    this.stop();
    this.current = instance;

    // ✅ Observer la disparition du mount (si tu remplaces le DOM)
    const obs = new MutationObserver(() => {
      // plus robuste que contains(): isConnected est direct
      if (!mount.isConnected) this.stop();

      // optionnel: si tu caches la vue au lieu de la retirer du DOM
      // const style = getComputedStyle(mount);
      // if (style.display === "none" || (mount as any).hidden) this.stop();
    });
    // Observe le parent du mount (plus fiable que document.body)
    const parent = mount.parentNode ?? document.body;
    obs.observe(parent, { childList: true, subtree: true });
    this.disconnectDomWatch = () => obs.disconnect();

    // ✅ Listeners globaux auto-nettoyés
    this.abortCtrl = new AbortController();
    const sig = this.abortCtrl.signal;
    const stop = () => this.stop();

    window.addEventListener("pagehide", stop,      { once: true, signal: sig });
    window.addEventListener("beforeunload", stop,  { once: true, signal: sig });
    window.addEventListener("popstate", stop,      { signal: sig });
    window.addEventListener("hashchange", stop,    { signal: sig }); // 👈 clé pour #/routes
  }

  stop() {
    try { this.current?.dispose(); } catch {}
    this.current = null;

    this.disconnectDomWatch?.();
    this.disconnectDomWatch = undefined;

    this.abortCtrl?.abort();
    this.abortCtrl = undefined;
  }
}

export const GAME_RUNTIME = new GameRuntime();
