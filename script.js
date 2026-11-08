(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var header = document.querySelector(".header");
  var nav = document.querySelector("#site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var mobileQuery = window.matchMedia("(max-width: 860px)");

  function setInert() {
    if (!nav) return;
    var closedOnMobile = mobileQuery.matches && !nav.classList.contains("is-open");
    nav.inert = closedOnMobile;
  }

  function closeNav(returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-on");
      backdrop.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    setInert();
    if (returnFocus) toggle.focus();
  }

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    nav.inert = false;
    if (backdrop) {
      backdrop.classList.add("is-on");
      backdrop.setAttribute("aria-hidden", "false");
    }
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    var firstLink = nav.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav(false);
      else openNav();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeNav(true);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav && nav.classList.contains("is-open")) {
      closeNav(true);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      if (nav && nav.classList.contains("is-open")) closeNav(false);
    });
  });

  function onViewportChange() {
    closeNav(false);
    setInert();
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", onViewportChange);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(onViewportChange);
  }

  setInert();

  document.querySelectorAll("[data-frame] img").forEach(function (img) {
    var frame = img.closest("[data-frame]");
    if (!frame) return;

    function markFallback() {
      frame.classList.add("has-fallback");
    }

    img.addEventListener("error", markFallback);
    if (img.complete && img.naturalWidth === 0) markFallback();
  });

  var filters = document.querySelectorAll(".filter");
  var cards = document.querySelectorAll(".card");

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var kind = button.getAttribute("data-filter");

      filters.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });

      cards.forEach(function (card) {
        var show = kind === "all" || card.getAttribute("data-kind") === kind;
        card.hidden = !show;
      });
    });
  });

  var dessertCard = document.querySelector("#dessert-of-the-day");
  var allFilter = document.querySelector('.filter[data-filter="all"]');
  var offerDialog = document.querySelector("#morning-offer");

  document.querySelectorAll(".gallery-action").forEach(function (button) {
    button.addEventListener("click", function () {
      var action = button.getAttribute("data-action");

      if (action === "dessert" && dessertCard) {
        if (allFilter) allFilter.click();
        dessertCard.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          block: "center"
        });
        dessertCard.classList.remove("is-highlighted");
        window.requestAnimationFrame(function () {
          dessertCard.classList.add("is-highlighted");
        });
      } else if (action === "about") {
        var aboutSection = document.querySelector("#about");
        if (aboutSection) {
          aboutSection.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: "start"
          });
        }
      } else if (action === "morning-offer" && offerDialog && !offerDialog.open) {
        offerDialog.showModal();
      }
    });
  });

  if (offerDialog) {
    var closeOffer = offerDialog.querySelector('[data-action="close-offer"]');
    if (closeOffer) {
      closeOffer.addEventListener("click", function () {
        offerDialog.close();
      });
    }

    offerDialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        offerDialog.close();
      }
    });

    offerDialog.addEventListener("click", function (event) {
      if (event.target === offerDialog) offerDialog.close();
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[href^='#']"));
  var sections = navLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  var scrollTick = false;

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);

    if (!sections.length) return;
    var marker = window.scrollY + header.offsetHeight + 24;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section;
    });

    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + current.id;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function requestScrollUpdate() {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(function () {
      scrollTick = false;
      onScroll();
    });
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  onScroll();

  var yearNode = document.querySelector("#year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  var status = document.querySelector("#open-status");
  var statusText = document.querySelector("#open-status-text");

  if (status && statusText) {
    var timeParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Samara",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var samaraTime = {};
    timeParts.forEach(function (part) {
      samaraTime[part.type] = part.value;
    });
    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var day = weekdays.indexOf(samaraTime.weekday);
    var minutes = Number(samaraTime.hour) * 60 + Number(samaraTime.minute);

    function shiftHours(weekDay) {
      var weekend = weekDay === 0 || weekDay === 6;
      return weekend
        ? { open: 9 * 60, close: 23 * 60 }
        : { open: 8 * 60, close: 22 * 60 };
    }

    function formatMinutes(total) {
      var hours = Math.floor(total / 60);
      var mins = total % 60;
      return String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
    }

    var today = shiftHours(day);

    if (minutes >= today.open && minutes < today.close) {
      status.classList.add("is-open");
      statusText.textContent = "Сейчас открыто · до " + formatMinutes(today.close);
    } else {
      var nextDay = day;
      if (minutes >= today.close) nextDay = (day + 1) % 7;
      var next = shiftHours(nextDay);
      status.classList.add("is-closed");
      statusText.textContent = "Сейчас закрыто · откроемся в " + formatMinutes(next.open);
    }
  }

  var revealNodes = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    revealNodes.forEach(function (node) {
      node.classList.add("is-in");
    });
  }
})();
