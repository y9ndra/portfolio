const SOUND_KEY = "portfolio-sound";
const SOUND_EVENT = "portfolio-sound-change";
let fallbackEnabled = true;

export function isSoundEnabled() {
  if (typeof window === "undefined") return true;
  try {
    const saved = window.localStorage.getItem(SOUND_KEY);
    return saved === null ? fallbackEnabled : saved !== "off";
  } catch {
    return fallbackEnabled;
  }
}

export function setSoundEnabled(enabled: boolean) {
  fallbackEnabled = enabled;
  try { window.localStorage.setItem(SOUND_KEY, enabled ? "on" : "off"); } catch { /* Keep the preference for this session. */ }
  window.dispatchEvent(new Event(SOUND_EVENT));
}

export function subscribeSound(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === SOUND_KEY || event.key === null) {
      if (event.newValue === null) fallbackEnabled = true;
      listener();
    }
  };
  window.addEventListener(SOUND_EVENT, listener);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(SOUND_EVENT, listener);
    window.removeEventListener("storage", storage);
  };
}
