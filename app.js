const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const sectionItems = [...entry.target.parentElement.querySelectorAll(".reveal")];
      const index = Math.max(0, sectionItems.indexOf(entry.target));
      entry.target.style.setProperty("--delay", `${Math.min(index * 95, 420)}ms`);
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let cursorReady = false;

function moveCursor() {
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;

  dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(moveCursor);
}

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!cursorReady) {
      cursorReady = true;
      ringX = mouseX;
      ringY = mouseY;
      document.body.classList.add("cursor-ready");
    }
  });

  document.querySelectorAll("a, button").forEach((target) => {
    target.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
    target.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
  });

  moveCursor();
}

const musicButton = document.querySelector(".music-toggle");
const musicText = document.querySelector(".music-text");
let audioContext;
let masterGain;
let musicOn = true;
let started = false;
let nodes = [];

function createTone(frequency, detune, delay) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.detune.value = detune;
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(audioContext.currentTime + delay);
  nodes.push({ oscillator, gain, frequency, delay });
}

function scheduleMusic() {
  nodes.forEach(({ gain, delay }, index) => {
    const now = audioContext.currentTime + delay;
    const level = index === 0 ? 0.055 : 0.032;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(level, now + 2.6);
    gain.gain.linearRampToValueAtTime(level * 0.55, now + 6.8);
    gain.gain.linearRampToValueAtTime(level, now + 10.5);
  });
}

function startMusic() {
  if (started) {
    if (audioContext?.state === "suspended") audioContext.resume();
    masterGain.gain.setTargetAtTime(musicOn ? 0.7 : 0, audioContext.currentTime, 0.35);
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioContext.destination);

  createTone(110, -4, 0);
  createTone(164.81, 3, 0.35);
  createTone(220, -8, 0.72);
  createTone(329.63, 6, 1.1);

  scheduleMusic();
  masterGain.gain.setTargetAtTime(0.7, audioContext.currentTime, 0.5);
  started = true;
}

function updateMusicButton() {
  musicButton.classList.toggle("is-off", !musicOn);
  musicButton.setAttribute("aria-pressed", String(musicOn));
  musicText.textContent = musicOn ? "Music ON" : "Music OFF";
}

function setMusicState(nextState) {
  musicOn = nextState;
  updateMusicButton();

  if (!audioContext) return;
  masterGain.gain.setTargetAtTime(musicOn ? 0.7 : 0, audioContext.currentTime, 0.28);
}

function tryAutoplay() {
  startMusic();
  audioContext.resume().catch(() => {
    setMusicState(false);
  });
}

musicButton.addEventListener("click", async () => {
  if (!started) startMusic();
  if (audioContext.state === "suspended") await audioContext.resume();
  setMusicState(!musicOn);
});

window.addEventListener("pointerdown", () => {
  if (!started && musicOn) startMusic();
}, { once: true });

window.addEventListener("load", () => {
  try {
    tryAutoplay();
  } catch {
    setMusicState(false);
  }
});
