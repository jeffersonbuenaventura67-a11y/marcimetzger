const body = document.body;
const header = document.querySelector(".site-header");
const loader = document.querySelector(".page-loader");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const menuLinks = document.querySelectorAll(".mobile-menu a");
const reveals = document.querySelectorAll(".reveal");
const parallaxEls = document.querySelectorAll("[data-parallax]");
const countEls = document.querySelectorAll("[data-count]");

let lastY = 0;
let ticking = false;

// Loader
window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("done"), 400);
});

// Menu
function setMenu(open) {
  body.classList.toggle("menu-open", open);
  mobileMenu.classList.toggle("open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  setMenu(!body.classList.contains("menu-open"));
});

menuLinks.forEach(link => link.addEventListener("click", () => setMenu(false)));

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });

reveals.forEach(el => revealObserver.observe(el));

// Number counters
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.count);
    const duration = 1200;
    const start = performance.now();

    function animate(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    countObserver.unobserve(el);
  });
}, { threshold: .65 });

countEls.forEach(el => countObserver.observe(el));

// Header + gentle parallax
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 60);

  if (y > lastY && y > 380 && !body.classList.contains("menu-open")) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  parallaxEls.forEach((el) => {
    const rect = el.parentElement.getBoundingClientRect();
    const viewportH = window.innerHeight;
    if (rect.bottom > 0 && rect.top < viewportH) {
      const progress = (viewportH - rect.top) / (viewportH + rect.height);
      el.style.transform = `scale(1.10) translate3d(0, ${(progress - .5) * 42}px, 0)`;
    }
  });

  lastY = y;
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

// Property filter
const searchForm = document.querySelector("#property-search");
const propertyCards = [...document.querySelectorAll(".property-card")];
const resultsCopy = document.querySelector("#results-copy");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const location = document.querySelector("#location").value;
  const type = document.querySelector("#type").value;
  const budget = document.querySelector("#budget").value;

  let visible = 0;

  propertyCards.forEach((card) => {
    const locationMatch = location === "all" || card.dataset.location === location;
    const typeMatch = type === "all" || card.dataset.type === type;
    const budgetMatch = budget === "all" || Number(card.dataset.price) <= Number(budget);
    const match = locationMatch && typeMatch && budgetMatch;

    card.classList.toggle("hidden-by-filter", !match);
    if (match) visible += 1;
  });

  resultsCopy.textContent = visible
    ? `${visible} residence${visible === 1 ? "" : "s"} match your selected criteria.`
    : "No current residences match these filters. Try broadening your search.";

  document.querySelector("#residences").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`${visible} matching residence${visible === 1 ? "" : "s"}`);
});

// Prevent placeholder links from jumping to top.
document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (e) => e.preventDefault());
});

onScroll();
