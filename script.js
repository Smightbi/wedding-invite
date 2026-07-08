(() => {
  "use strict";

  const root = document.documentElement;
  const envelopeOverlay = document.getElementById("envelopeOverlay");
  const audio = document.getElementById("bgAudio");
  const soundToggle = document.getElementById("soundToggle");
  const assets = ["assets/Background.png", "assets/Flowers.png"];

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const preload = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    });

  const fontsReady =
    "fonts" in document ? document.fonts.ready : Promise.resolve();

  // Warm the cache in the background. Opening no longer happens on a
  // timer — the envelope tap is what reveals the invitation — so this
  // is just a head start on the images/fonts, not a gate on anything.
  Promise.all([...assets.map(preload), fontsReady]);

  let started = false;

  const removeEnvelope = () => {
    if (envelopeOverlay) envelopeOverlay.style.display = "none";
  };

  const revealContent = () => {
    root.classList.add("is-loaded");
  };

  const playAudio = () => {
    if (!audio) return;
    audio.play().catch(() => {});
  };

  // Timings below mirror the durations authored in style.css
  // (envelope__flap / envelope-overlay / cardEmerge keyframes) so the
  // JS handoffs land exactly when each CSS animation finishes.
  const FLAP_OPEN_MS = 1300;
  const MICRO_PAUSE_MS = 300;
  const ENVELOPE_FADE_MS = 1100;
  const CARD_EMERGE_MS = 1400;

  const runEnvelopeSequence = () => {
    // 1. Unseal — the wax seal pops and the flap folds open.
    root.classList.add("envelope-open");

    // 2. After a brief micro-pause once the flap has settled open, the
    //    card emerges and glides upward out of the pocket while the
    //    envelope itself fades away — the two blend together rather
    //    than cutting sharply from one to the other.
    setTimeout(() => {
      root.classList.add("envelope-closing");
      root.classList.add("card-emerge");
      setTimeout(removeEnvelope, ENVELOPE_FADE_MS + 60);

      // 3. Once the card has settled, cascade the interior content.
      setTimeout(revealContent, CARD_EMERGE_MS + 100);
    }, FLAP_OPEN_MS + MICRO_PAUSE_MS);
  };

  // The tap/click that opens the envelope is the same user gesture that
  // starts the music — browsers require a direct gesture before audio
  // is allowed to play, so the two are triggered together here.
  const openInvitation = () => {
    if (started) return;
    started = true;
    playAudio();
    runEnvelopeSequence();
  };

  const skipToFinalState = () => {
    started = true;
    removeEnvelope();
    root.classList.add("card-emerge", "is-loaded");
  };

  if (prefersReducedMotion) {
    skipToFinalState();
  } else if (envelopeOverlay) {
    envelopeOverlay.addEventListener("click", openInvitation, { once: true });
    envelopeOverlay.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        openInvitation();
      }
    });
  }

  if (soundToggle && audio) {
    soundToggle.addEventListener("click", () => {
      if (audio.paused) {
        audio.muted = false;
        playAudio();
      } else {
        audio.muted = !audio.muted;
      }
      soundToggle.classList.toggle("is-muted", audio.muted);
      soundToggle.setAttribute("aria-pressed", String(audio.muted));
      soundToggle.setAttribute("aria-label", audio.muted ? "پخش صدا" : "قطع صدا");
    });
  }

  const btn = document.querySelector(".location-btn");
  if (btn) {
    btn.addEventListener("pointerdown", () => {
      btn.style.transition = "transform 0.15s ease";
    });
    btn.addEventListener("pointerup", () => {
      btn.style.transition = "";
    });
  }
})();
