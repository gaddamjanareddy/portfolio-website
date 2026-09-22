/* ============================================================
   Janareddy Gaddam - Portfolio
   No dependencies. Everything below is progressive enhancement.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* --------------------------------------------------------
     Theme
     -------------------------------------------------------- */
  var stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (e) {
    /* storage blocked - fall back to the default */
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#fbfbfd" : "#060608");
  }

  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  }

  var themebtn = document.getElementById("themebtn");
  if (themebtn) {
    themebtn.addEventListener("click", function () {
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
  var navtoggle = document.getElementById("navtoggle");
  var navlinks = document.getElementById("navlinks");

  function closeNav() {
    if (!navlinks) return;
    navlinks.classList.remove("open");
    if (navtoggle) {
      navtoggle.setAttribute("aria-expanded", "false");
      navtoggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }
  }

  if (navtoggle && navlinks) {
    navtoggle.addEventListener("click", function () {
      var open = navlinks.classList.toggle("open");
      navtoggle.setAttribute("aria-expanded", open ? "true" : "false");
      navtoggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });

    navlinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* --------------------------------------------------------
     Sticky nav, progress bar, back to top
     -------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("bar");
  var totop = document.getElementById("totop");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("stuck", y > 12);
    if (totop) totop.classList.toggle("show", y > 700);

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    sweepReveals();
    spy();

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      // Reveals run outside the rAF gate on purpose. requestAnimationFrame is
      // throttled whenever the page is not painting (background tab, reduced
      // rendering), and content stuck at opacity 0 is a correctness bug, not a
      // dropped animation frame. The sweep list empties as it goes, so this
      // costs nothing once everything is visible.
      sweepReveals();

      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  onScroll();

  if (totop) {
    totop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------
     Scroll-spy

     Sweep, not an observer: the marker tiles are short, so a
     percentage-band IntersectionObserver skips straight past them.
     -------------------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".navlink"));
  var targets = links
    .map(function (link) {
      var id = link.getAttribute("href");
      var el = id && id.charAt(0) === "#" ? document.querySelector(id) : null;
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function spy() {
    // onScroll runs once before this block is evaluated, so guard the var
    if (!targets || !targets.length) return;
    var line = 140;
    var active = null;
    targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top <= line) active = t.link;
    });
    links.forEach(function (link) {
      link.classList.toggle("on", link === active);
    });
  }

  /* --------------------------------------------------------
     Reveal on scroll

     Deliberately a scroll sweep rather than an IntersectionObserver.
     An observer never fires when an element goes from below the
     viewport to above it without a rendered frame in between - an
     anchor jump or a flick scroll does exactly that - which leaves
     content stuck at opacity 0. A sweep cannot miss: anything at or
     above the fold that has not been revealed yet gets revealed.
     -------------------------------------------------------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".rv"));

  function revealAll() {
    revealables.forEach(function (el) {
      el.classList.add("in");
    });
    revealables = [];
  }

  function sweepReveals() {
    // onScroll runs once before this block is evaluated, so guard the var
    if (!revealables || !revealables.length) return;

    var limit = window.innerHeight * 0.92;
    var shown = 0;
    var remaining = [];

    revealables.forEach(function (el) {
      if (el.getBoundingClientRect().top >= limit) {
        remaining.push(el);
        return;
      }
      // stagger whatever comes into view together
      el.style.transitionDelay = Math.min(shown, 5) * 80 + "ms";
      el.classList.add("in");
      shown++;
    });

    revealables = remaining;
  }

  if (reduceMotion) {
    revealAll();
  } else {
    sweepReveals();
    window.addEventListener("resize", sweepReveals, { passive: true });
    // fonts and images settle after load and can shift things upward
    window.addEventListener("load", sweepReveals);
  }

  /* --------------------------------------------------------
     Count-up numbers
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
    var duration = 1400;

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
     Hero: split the headline into words so each one rises in
     -------------------------------------------------------- */
  var headline = document.querySelector("[data-split]");
  if (headline) {
    if (reduceMotion) {
      root.classList.add("ready");
    } else {
      var words = headline.textContent.trim().split(/\s+/);
      headline.textContent = "";
      words.forEach(function (word, i) {
        var outer = document.createElement("span");
        outer.className = "w";
        var inner = document.createElement("span");
        inner.textContent = word;
        inner.style.setProperty("--d", 60 + i * 55 + "ms");
        outer.appendChild(inner);
        headline.appendChild(outer);
        if (i < words.length - 1) headline.appendChild(document.createTextNode(" "));
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          root.classList.add("ready");
        });
      });
    }
  }

  /* --------------------------------------------------------
     Background orbs drift with the pointer
     -------------------------------------------------------- */
  var orbs = Array.prototype.slice.call(document.querySelectorAll("[data-orb]"));
  if (orbs.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener(
      "pointermove",
      function (e) {
        var dx = e.clientX / window.innerWidth - 0.5;
        var dy = e.clientY / window.innerHeight - 0.5;
        orbs.forEach(function (orb) {
          var k = parseFloat(orb.getAttribute("data-orb")) || 1;
          orb.style.transform = "translate3d(" + dx * 42 * k + "px," + dy * 42 * k + "px,0)";
        });
      },
      { passive: true }
    );
  }

  /* --------------------------------------------------------
     Pointer spotlight on skill cards
     -------------------------------------------------------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-spot]"), function (el) {
      el.addEventListener(
        "pointermove",
        function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
          el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
        },
        { passive: true }
      );
    });
  }

  /* --------------------------------------------------------
     Marquee: duplicate the track so the loop is seamless
     -------------------------------------------------------- */
  var track = document.getElementById("marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;

  /* --------------------------------------------------------
     GitHub - all from GitHub's own public API, so there is no
     third-party service to go down. Failures hide their panel.
     -------------------------------------------------------- */
  var GH_USER = "gaddamjanareddy";
  var ghNums = document.getElementById("ghNums");
  var ghLangs = document.getElementById("ghLangs");
  var ghRepos = document.getElementById("ghRepos");

  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  if (ghNums || ghLangs) {
    var api = "https://api.github.com/users/" + GH_USER;

    fetch(api)
      .then(function (r) {
        if (!r.ok) throw new Error("profile");
        return r.json();
      })
      .then(function (user) {
        if (!ghNums) return;
        var since = new Date(user.created_at).getFullYear();
        ghNums.innerHTML =
          '<div class="ghn"><b>' + esc(user.public_repos) + "</b><span>Repositories</span></div>" +
          '<div class="ghn"><b>' + esc(user.followers) + "</b><span>Followers</span></div>" +
          '<div class="ghn"><b>' + esc(user.following) + "</b><span>Following</span></div>" +
          '<div class="ghn"><b>' + esc(since) + "</b><span>On GitHub since</span></div>";
      })
      .catch(function () {
        if (ghNums) ghNums.innerHTML = '<p class="msg">Unavailable right now.</p>';
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

        // primary language of each repo, as a share of the total
        var counts = {};
        var total = 0;
        repos.forEach(function (repo) {
          if (!repo.language) return;
          counts[repo.language] = (counts[repo.language] || 0) + 1;
          total++;
        });

        var names = Object.keys(counts).sort(function (a, b) {
          return counts[b] - counts[a];
        });

        if (ghLangs) {
          if (total && names.length) {
            ghLangs.innerHTML = names
              .slice(0, 5)
              .map(function (lang) {
                var pct = Math.round((counts[lang] / total) * 100);
                return (
                  '<div class="lang">' +
                  '<div class="lang__top"><span>' + esc(lang) + "</span><i>" + pct + "%</i></div>" +
                  '<div class="lang__bar"><i style="width:' + pct + '%"></i></div>' +
                  "</div>"
                );
              })
              .join("");
          } else {
            ghLangs.innerHTML = '<p class="msg">No language data.</p>';
          }
        }

        if (ghRepos) {
          ghRepos.innerHTML = repos
            .slice(0, 4)
            .map(function (repo) {
              return (
                '<a class="repo" href="' + esc(repo.html_url) + '" target="_blank" rel="noopener">' +
                "<b>" + esc(repo.name) + "</b>" +
                "<span>" + esc(repo.language || "Repository") + "</span></a>"
              );
            })
            .join("");
          ghRepos.hidden = false;
        }
      })
      .catch(function () {
        if (ghLangs) ghLangs.innerHTML = '<p class="msg">Unavailable right now.</p>';
      });
  }

  /* --------------------------------------------------------
     Contact form

     Posts to Formspree. Create a free form at https://formspree.io,
     put the endpoint in FORMSPREE_ENDPOINT below and in the form's
     action attribute in index.html.

     While the placeholder is in place, the form falls back to
     opening the visitor's mail app, so it is never broken.
     -------------------------------------------------------- */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
  var EMAIL = "janareddygaddam2008@gmail.com";

  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var submit = document.getElementById("formSubmit");

  function say(text, tone) {
    if (!note) return;
    note.textContent = text;
    note.style.color = tone === "error" ? "#e0685a" : tone === "ok" ? "#57c98a" : "";
  }

  function mailtoFallback(name, email, subject, message) {
    var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message + "\n";
    window.location.href =
      "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    say("Opening your email app…");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // form.elements, not form.name - HTMLFormElement.name is the form's own attribute
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
          if (!res.ok) throw new Error("failed");
          form.reset();
          say("Thanks — your message is on its way.", "ok");
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
