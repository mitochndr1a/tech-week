// ============================================================
// Tech Week 2026 — landing page behaviour
// ============================================================

// ---- Scale the fixed 1600px-wide "stage" to fit the viewport ----
// The whole page is authored at a fixed 1600×900-per-section canvas
// (matching the design mockups exactly) and then scaled uniformly,
// the same way a slide deck fits a screen. This keeps every element
// exactly where it was designed, at any window size.
const stage = document.getElementById("stage");
const stageOuter = document.querySelector(".stage-outer");
const globalHeader = document.querySelector(".global-header-wrap");

function fitStage() {
  const scale = window.innerWidth / 1600;
  stage.style.transform = `scale(${scale})`;
  if (globalHeader) globalHeader.style.transform = `scale(${scale})`;
  stageOuter.style.height = `${stage.offsetHeight * scale}px`;
}
window.addEventListener("resize", fitStage);
fitStage();
// Re-measure once images/fonts have settled in (natural height can shift slightly).
window.addEventListener("load", fitStage);

// ---- Animated mascot (Lottie), loaded from a locally bundled copy ----
function loadRobot(containerId) {
  const el = document.getElementById(containerId);
  if (!el || typeof lottie === "undefined") return null;

  try {
    return lottie.loadAnimation({
      container: el,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "images/robot.json",
    });
  } catch (err) {
    console.warn("Robot animation could not be loaded:", err);
    return null;
  }
}

loadRobot("robot-lottie");

// ---- Robot reacts to the cursor: a gentle parallax tilt/float ----
// Each robot drifts a little toward the pointer and tilts slightly,
// easing back to center when the pointer leaves.
function makeCursorReactive(el, strength = 18) {
  if (!el) return;
  let raf = null;

  function handleMove(clientX, clientY) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (clientX - cx) / (window.innerWidth / 2);
    const dy = (clientY - cy) / (window.innerHeight / 2);

    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const tx = Math.max(-1, Math.min(1, dx)) * strength;
      const ty = Math.max(-1, Math.min(1, dy)) * strength * 0.6;
      const rot = Math.max(-1, Math.min(1, dx)) * 4;
      el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
    });
  }

  window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener("mouseleave", () => {
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = "translate(0, 0) rotate(0deg)";
  });
}

makeCursorReactive(document.getElementById("hero-robot"));

// ---- Registration countdown ----
// TechWeek begins on September 21, 2026 (local browser time).
const eventStart = new Date("2026-09-21T00:00:00");
const countdownEls = {
  days: document.getElementById("count-days"),
  hours: document.getElementById("count-hours"),
  minutes: document.getElementById("count-minutes"),
  seconds: document.getElementById("count-seconds")
};

function updateCountdown() {
  if (!countdownEls.days) return;
  const remaining = Math.max(0, eventStart.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownEls.days.textContent = String(days).padStart(2, "0");
  countdownEls.hours.textContent = String(hours).padStart(2, "0");
  countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
  countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---- Registration form: client-side only, no backend/database ----
const form = document.getElementById("register-form");
const successOverlay = document.getElementById("register-success-overlay");
const successMessage = document.getElementById("register-success-name");
const registerAgainBtn = document.getElementById("register-again");
const registerCloseBtn = document.getElementById("register-close");
const registerCloseMainBtn = document.getElementById("register-close-main");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let valid = true;
  form.querySelectorAll(".field").forEach((field) => field.classList.remove("field-error"));

  form.querySelectorAll("[required]").forEach((input) => {
    if (!input.value) {
      valid = false;
      input.closest(".field").classList.add("field-error");
    }
  });

  const activityChecks = [...form.querySelectorAll('input[name="activities"]')];
  const activitiesHint = document.getElementById("activities-hint");
  const selectedActivities = activityChecks.filter((checkbox) => checkbox.checked);
  if (selectedActivities.length === 0) {
    valid = false;
    activitiesHint.classList.add("error");
    activitiesHint.textContent = "Please select at least one activity.";
  } else {
    activitiesHint.classList.remove("error");
    activitiesHint.textContent = `${selectedActivities.length} activit${selectedActivities.length === 1 ? "y" : "ies"} selected.`;
  }

  if (!valid) return;

  const fullName = form.fullname.value.trim();
  const firstName = fullName.split(" ")[0];

  successMessage.textContent =
    `Thanks, ${firstName}! You're officially in for Tech Week 2026 — we'll email you the full schedule soon. See you there!`;

  successOverlay.hidden = false;
  document.body.classList.add("modal-open");
  registerCloseBtn.focus();
});

function closeSuccessModal() {
  successOverlay.hidden = true;
  document.body.classList.remove("modal-open");
}

registerCloseBtn.addEventListener("click", closeSuccessModal);
registerCloseMainBtn.addEventListener("click", closeSuccessModal);

registerAgainBtn.addEventListener("click", () => {
  form.reset();
  form.querySelectorAll(".field").forEach((field) => field.classList.remove("field-error"));
  const activitiesHint = document.getElementById("activities-hint");
  activitiesHint.classList.remove("error");
  activitiesHint.textContent = "Select at least one activity.";
  closeSuccessModal();
  document.getElementById("register").scrollIntoView({ behavior: "smooth", block: "start" });
});

successOverlay.addEventListener("click", (event) => {
  if (event.target === successOverlay) closeSuccessModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !successOverlay.hidden) closeSuccessModal();
});
