/* ============================================================
   Janareddy Gaddam - Portfolio
   No dependencies. Everything below is progressive enhancement.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------
     Theme toggle (persisted)
     -------------------------------------------------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  var stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (e) {
    /* storage blocked - fall back to the default theme */
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f8fb" : "#080b12");
  }

  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    // no choice saved yet - follow the visitor's system preference
    applyTheme("light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* ignore */
      }
    });
  }

  /* --------------------------------------------------------
     Mobile navigation
     -------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* --------------------------------------------------------
     Sticky nav state + scroll progress + back to top
     -------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------
     Scroll-spy: highlight the section in view
     -------------------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* --------------------------------------------------------
     Reveal on scroll
     -------------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("is-in");
    });
  } else {
    var revealer = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry, i) {
          // reveal on entry, and also for anything a fast scroll or an anchor
          // jump already carried above the viewport
          var passed = entry.boundingClientRect.bottom < 0;
          if (!entry.isIntersecting && !passed) return;
          var el = entry.target;
          // stagger siblings slightly so grids cascade in
          var delay = Math.min(i, 5) * 70;
          setTimeout(function () {
            el.classList.add("is-in");
          }, delay);
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    Array.prototype.forEach.call(revealables, function (el) {
      revealer.observe(el);
    });
  }

  /* --------------------------------------------------------
     Hero role typewriter
     -------------------------------------------------------- */
  var typed = document.getElementById("typed");
  var phrases = [
    "Software Developer - React.js / Node.js",
    "Real-time dashboards with WebSockets",
    "Interactive map interfaces",
    "Building full-stack depth in Node.js",
  ];

  if (typed) {
    if (reduceMotion) {
      typed.textContent = phrases[0];
    } else {
      var pi = 0;
      var ci = 0;
      var deleting = false;

      (function type() {
        var phrase = phrases[pi];
        typed.textContent = phrase.slice(0, ci);

        var wait = deleting ? 34 : 62;

        if (!deleting && ci === phrase.length) {
          deleting = true;
          wait = 1900;
        } else if (deleting && ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          wait = 320;
        } else {
          ci += deleting ? -1 : 1;
        }

        setTimeout(type, wait);
      })();
    }
  }

  /* --------------------------------------------------------
     Count-up stats
     -------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");

  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var start = performance.now();
    var duration = 1200;

    (function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var countObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    Array.prototype.forEach.call(counters, function (el) {
      countObserver.observe(el);
    });
  } else {
    Array.prototype.forEach.call(counters, runCount);
  }

  /* --------------------------------------------------------
     Marquee: duplicate the track so the loop is seamless
     -------------------------------------------------------- */
  var track = document.getElementById("marqueeTrack");
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* --------------------------------------------------------
     GitHub section

     Everything here comes from GitHub's own public API, so there is
     no third-party service to go down. Any panel whose request fails
     hides itself rather than showing an empty box.
     -------------------------------------------------------- */
  var GH_USER = "gaddamjanareddy";
  var ghFallback = document.getElementById("ghFallback");

  function ghHide(panel) {
    if (panel) panel.hidden = true;
    if (!document.querySelectorAll(".gh__panel:not([hidden])").length && ghFallback) {
      ghFallback.hidden = false;
    }
  }

  var ghProfilePanel = document.getElementById("ghProfilePanel");
  var ghLangPanel = document.getElementById("ghLangPanel");
  var ghReposPanel = document.getElementById("ghReposPanel");

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  if (ghProfilePanel || ghLangPanel) {
    var api = "https://api.github.com/users/" + GH_USER;

    fetch(api)
      .then(function (r) {
        if (!r.ok) throw new Error("profile");
        return r.json();
      })
      .then(function (user) {
        var body = document.getElementById("ghProfileBody");
        if (!body) return;

        var since = new Date(user.created_at).getFullYear();
        body.innerHTML =
          '<div class="gh__stats">' +
          '<div class="gh__stat"><b>' + esc(user.public_repos) + "</b><span>Repositories</span></div>" +
          '<div class="gh__stat"><b>' + esc(user.followers) + "</b><span>Followers</span></div>" +
          '<div class="gh__stat"><b>' + esc(user.following) + "</b><span>Following</span></div>" +
          '<div class="gh__stat"><b>' + esc(since) + "</b><span>On GitHub since</span></div>" +
          "</div>";
      })
      .catch(function () {
        ghHide(ghProfilePanel);
      });

    fetch(api + "/repos?per_page=100&sort=updated")
      .then(function (r) {
        if (!r.ok) throw new Error("repos");
        return r.json();
      })
      .then(function (repos) {
        repos = repos.filter(function (repo) {
          return !repo.fork;
        });

        if (!repos.length) throw new Error("empty");

        // top languages, by how many repos use each as their primary language
        var counts = {};
        var total = 0;
        repos.forEach(function (repo) {
          if (!repo.language) return;
          counts[repo.language] = (counts[repo.language] || 0) + 1;
          total++;
        });

        var langBody = document.getElementById("ghLangBody");
        var langs = Object.keys(counts).sort(function (a, b) {
          return counts[b] - counts[a];
        });

        if (langBody && total && langs.length) {
          langBody.innerHTML = langs
            .slice(0, 5)
            .map(function (lang) {
              var pct = Math.round((counts[lang] / total) * 100);
              return (
                '<div class="gh__lang">' +
                '<div class="gh__lang-head"><span>' + esc(lang) + "</span><span>" + pct + "%</span></div>" +
                '<div class="gh__bar"><i style="width:' + pct + '%"></i></div>' +
                "</div>"
              );
            })
            .join("");
        } else {
          ghHide(ghLangPanel);
        }

        // most recently updated repositories
        var reposBody = document.getElementById("ghReposBody");
        if (reposBody) {
          reposBody.innerHTML = repos
            .slice(0, 4)
            .map(function (repo) {
              return (
                '<a class="gh__repo" href="' + esc(repo.html_url) + '" target="_blank" rel="noopener">' +
                '<span class="gh__repo-name"><i class="fa-solid fa-book-bookmark"></i>' + esc(repo.name) + "</span>" +
                '<span class="gh__repo-desc">' + esc(repo.description || "No description") + "</span>" +
                '<span class="gh__repo-meta">' +
                (repo.language ? "<span>" + esc(repo.language) + "</span>" : "") +
                "<span><i class='fa-regular fa-star'></i>" + esc(repo.stargazers_count) + "</span>" +
                "</span></a>"
              );
            })
            .join("");
          if (ghReposPanel) ghReposPanel.hidden = false;
        }
      })
      .catch(function () {
        ghHide(ghLangPanel);
        ghHide(ghReposPanel);
      });
  }

  /* --------------------------------------------------------
     Contact form

     Posts to Formspree. Create a free form at https://formspree.io,
     then put your endpoint in FORMSPREE_ENDPOINT below and in the
     form's action attribute in index.html.

     While the placeholder is still in place, the form falls back to
     opening the visitor's mail app, so it is never broken.
     -------------------------------------------------------- */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xyeybjlb";
  var EMAIL = "janareddygaddam2008@gmail.com";

  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var submit = document.getElementById("formSubmit");

  function say(text, tone) {
    if (!note) return;
    note.textContent = text;
    note.style.color =
      tone === "error" ? "#f87171" : tone === "ok" ? "#34d399" : "";
  }

  function mailtoFallback(name, email, subject, message) {
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message + "\n";
    window.location.href =
      "mailto:" +
      EMAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    say("Opening your email app…");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // form.elements, not form.name — HTMLFormElement.name is the form's own attribute
      var fields = form.elements;
      var name = fields.name.value.trim();
      var email = fields.email.value.trim();
      var subject = fields.subject.value.trim();
      var message = fields.message.value.trim();

      if (!name || !email || !subject || !message) {
        say("Please fill in every field before sending.", "error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say("That email address does not look right.", "error");
        return;
      }

      if (FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") !== -1) {
        mailtoFallback(name, email, subject, message);
        return;
      }

      if (submit) submit.disabled = true;
      say("Sending…");

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          form.reset();
          say("Thanks — your message is on its way. I will reply soon.", "ok");
        })
        .catch(function () {
          say("Something went wrong. Opening your email app instead…", "error");
          mailtoFallback(name, email, subject, message);
        })
        .then(function () {
          if (submit) submit.disabled = false;
        });
    });
  }

  /* --------------------------------------------------------
     Footer year
     -------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
