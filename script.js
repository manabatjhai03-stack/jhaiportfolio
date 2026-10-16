const loadingScreen = document.getElementById("loading-screen");
const homepage = document.getElementById("homepage");
const typingText = document.getElementById("typing-text");
const themeToggle = document.getElementById("theme-toggle");
const hangingID = document.getElementById("hanging-id");
const idCard = document.getElementById("id-card");
const laceLeft = document.getElementById("lace-left");
const laceRight = document.getElementById("lace-right");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
// =====================================================
// TYPING ANIMATION
// =====================================================
const texts = [
    "Hello, I'm Jhai.",
    "Miss ko na siya."
];
let textIndex = 0;
let charIndex = 0;
let deleting = false;
function typeEffect() {
    const currentText = texts[textIndex];
    if (!deleting) {
        typingText.textContent =
            currentText.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentText.length) {
            deleting = true;
            setTimeout(typeEffect, 1500);
            return;
        }
    } else {
        typingText.textContent =
            currentText.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            deleting = false;
            textIndex++;
            if (textIndex >= texts.length) {
                textIndex = 0;
            }
        }
    }
    const speed = deleting ? 50 : 90;
    setTimeout(typeEffect, speed);
}
typeEffect();
// =====================================================
// LOADING → HOMEPAGE
// =====================================================
window.addEventListener("load", () => {
    setTimeout(() => {
        loadingScreen.classList.add("hide");
        setTimeout(() => {
            homepage.classList.add("show");
            startIDDrop();
            const heroElements =
            document.querySelectorAll(".hero-animate");
            heroElements.forEach((element, index) => {
            setTimeout(() => {
                heroElements[index].classList.add("show");
            }, index * 180);
        });
        typeRole();
    }, 1000);
}, 5000);
});

// =====================================================
// THEME
// =====================================================
const themeIcon = document.getElementById("theme-icon");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    // moon = dark mode, sun = light mode
    themeIcon.src = isLight ? "arawshit.png" : "buwanshit.png";
});
// =====================================================
// HANGING ID
// =====================================================
// normal position
const homeX = 110;
const homeY = 270;
// current position
let idX = homeX;
let idY = -500;
// target position
let targetX = homeX;
let targetY = homeY;
// velocity
let velocityX = 0;
let velocityY = 0;
// rotation
let rotation = 2;
let targetRotation = 2;
// drag
let draggingID = false;
let startPointerX = 0;
let startPointerY = 0;
let startCardX = 0;
let startCardY = 0;
// movement
let windTime = 0;
// drop
let dropping = false;
let dropVelocity = 0;
// =====================================================
// START DROP
// =====================================================
function startIDDrop() {
    dropping = true;
    idX = homeX;
    idY = -500;
    velocityX = 0;
    velocityY = 0;
    rotation = -8;
    targetRotation = 2;
}
// =====================================================
// UPDATE LACE
// =====================================================
function updateLace() {
    const anchorX = 110;
    const anchorY = 0;

    const wind = Math.sin(windTime) * 4;
    const wind2 = Math.sin(windTime * 0.7) * 2;

    // ID card position: centered at idX, top at idY
    const leftEndX = idX - 12;
    const rightEndX = idX + 12;
    const endY = idY;

    const leftPath = `
        M ${anchorX - 7} ${anchorY}
        C ${anchorX - 18 + wind} ${endY * 0.35},
          ${leftEndX - 24 + wind2} ${endY * 0.78},
          ${leftEndX} ${endY}
    `;

    const rightPath = `
        M ${anchorX + 7} ${anchorY}
        C ${anchorX + 18 + wind} ${endY * 0.35},
          ${rightEndX + 24 + wind2} ${endY * 0.78},
          ${rightEndX} ${endY}
    `;

    laceLeft.setAttribute("d", leftPath);
    laceRight.setAttribute("d", rightPath);
}
// =====================================================
// UPDATE ID
// =====================================================
function updateID() {
    idCard.style.left =
        `${idX}px`;
    idCard.style.top =
        `${idY}px`;
    idCard.style.transform =
        `translateX(-50%) rotate(${rotation}deg)`;
    updateLace();
}
// =====================================================
// DRAG START
// =====================================================
idCard.addEventListener(
    "pointerdown",
    (e) => {
        if (dropping) return;
        draggingID = true;
        idCard.setPointerCapture(
            e.pointerId
        );
        startPointerX =
            e.clientX;
        startPointerY =
            e.clientY;
        startCardX =
            idX;
        startCardY =
            idY;
        velocityX = 0;
        velocityY = 0;
        e.preventDefault();
    }
);
// =====================================================
// DRAGGING
// =====================================================
idCard.addEventListener(
    "pointermove",
    (e) => {
        if (!draggingID)
            return;
        const dx =
            e.clientX -
            startPointerX;
        const dy =
            e.clientY -
            startPointerY;
        targetX =
            startCardX + dx;
        targetY =
            startCardY + dy;
        // horizontal limit
        targetX =
            Math.max(
                25,
                Math.min(
                    195,
                    targetX
                )
            );
        // vertical limit
        targetY =
            Math.max(
                150,
                Math.min(
                    430,
                    targetY
                )
            );
        // rotation while dragging
        targetRotation =
            2 +
            (targetX - 110) * 0.075;
        // movement velocity
        velocityX =
            dx * 0.055;
        velocityY =
            dy * 0.055;
    }
);
// =====================================================
// RELEASE
// =====================================================
function releaseID() {
    if (!draggingID)
        return;
    draggingID = false;
    targetX = homeX;
    targetY = homeY;
    targetRotation = 2;
}
// pointer up
idCard.addEventListener(
    "pointerup",
    releaseID
);
// pointer cancel
idCard.addEventListener(
    "pointercancel",
    releaseID
);
// =====================================================
// ID PHYSICS
// =====================================================
function animateID() {
    windTime += 0.025;
    // =================================================
    // DROP ANIMATION
    // =================================================
    if (dropping) {
        // gravity
        dropVelocity += 0.75;
        idY += dropVelocity;
        // slight side movement
        idX =
            homeX +
            Math.sin(
                windTime * 1.8
            ) * 3;
        // rotation during fall
        rotation +=
            (-8 - rotation) * 0.025;
        // landing
        if (idY >= homeY) {
            idY = homeY;
            dropVelocity = -10;
            dropping = false;
            targetX = homeX;
            targetY = homeY;
            targetRotation = 2;
        }
    }
    // =================================================
    // NORMAL PHYSICS
    // =================================================
    else {
        const spring = 0.055;
        const friction = 0.88;
        // X
        const forceX =
            targetX - idX;
        velocityX +=
            forceX * spring;
        velocityX *=
            friction;
        idX +=
            velocityX;
        // Y
        const forceY =
            targetY - idY;
        velocityY +=
            forceY * spring;
        velocityY *=
            friction;
        idY +=
            velocityY;
        // wind
        const windRotation =
            Math.sin(
                windTime * 1.2
            ) * 0.8;
        // final rotation
        const rotationTarget =
            targetRotation
            + velocityX * 0.4
            + windRotation;
        rotation +=
            (
                rotationTarget -
                rotation
            ) * 0.08;
    }
    updateID();
    requestAnimationFrame(
        animateID
    );
}
// =====================================================
// START ID
// =====================================================
updateID();
animateID();
// =====================================================
// FLIP ID
// =====================================================
idCard.addEventListener(
    "click",
    () => {
        if (dropping)
            return;
        idCard.classList.toggle(
            "flipped"
        );
    }
);
// =====================================================
// MOBILE MENU
// =====================================================
if (menuToggle && navLinks) {
    menuToggle.addEventListener(
        "click",
        () => {
            navLinks.classList.toggle(
                "active"
            );
            const isOpen =
                navLinks.classList.contains(
                    "active"
                );
            menuToggle.textContent =
                isOpen
                    ? "✕"
                    : "☰";
            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );
        }
    );
    navLinks
        .querySelectorAll("a")
        .forEach(link => {
            link.addEventListener(
                "click",
                () => {
                    navLinks.classList.remove(
                        "active"
                    );
                    menuToggle.textContent =
                        "☰";
                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}
window.addEventListener("load", () => {
    setTimeout(() => {
        const heroElements =
            document.querySelectorAll(".hero-animate");
        heroElements.forEach((element) => {
            element.classList.add("show");
        });
    }, 5200);
});
const roleTyping = document.getElementById("role-typing");
const roleText = [
    "FULL-STACK DEVELOPER",
    "EDITOR-VIDEOGRAPHER/PHOTOGRAPHER",
    "UI/UX DESIGNER."
];
let roleLine = 0;
let roleChar = 0;
function typeRole() {
    if (!roleTyping) return;
    if (roleChar < roleText[roleLine].length) {
        roleTyping.textContent += roleText[roleLine].charAt(roleChar);
        roleChar++;
        setTimeout(typeRole, 70);
    } else {
        setTimeout(() => {
            roleTyping.textContent = "";
            roleChar = 0;
            roleLine++;
            if (roleLine >= roleText.length) {
                roleLine = 0;
            }
            typeRole();
        }, 1200);
    }
}
const trueFocus = document.querySelector(".true-focus-name");
if (trueFocus) {
    const words = trueFocus.querySelectorAll(".focus-word");
    const frame = trueFocus.querySelector(".focus-frame");
    let currentIndex = 0;
    function updateFocus() {
        const activeWord = words[currentIndex];
        words.forEach(word => {
            word.classList.remove("active");
        });
        activeWord.classList.add("active");
        // position ng focus frame
        frame.style.left = `${activeWord.offsetLeft}px`;
        frame.style.width = `${activeWord.offsetWidth}px`;
        frame.style.height = `${activeWord.offsetHeight}px`;
    }
    updateFocus();
    setInterval(() => {
        currentIndex++;
        if (currentIndex >= words.length) {
            currentIndex = 0;
        }
        updateFocus();
    }, 1500);
}
const profileCard = document.querySelector(".profile-card");
if (profileCard) {
    function moveCard(clientX, clientY) {
        const rect = profileCard.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = ((centerY - y) / centerY) * 10;
        const mouseX = (x / rect.width) * 100;
        const mouseY = (y / rect.height) * 100;
        profileCard.style.transform =
            `perspective(900px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             scale(1.02)`;
        profileCard.style.setProperty(
            "--mouse-x",
            `${mouseX}%`
        );
        profileCard.style.setProperty(
            "--mouse-y",
            `${mouseY}%`
        );
        profileCard.style.setProperty(
            "--shine-x",
            `${mouseX}%`
        );
        profileCard.style.setProperty(
            "--shine-y",
            `${mouseY}%`
        );
    }
    /* DESKTOP */
    profileCard.addEventListener("mousemove", (e) => {
        moveCard(e.clientX, e.clientY);
    });
    profileCard.addEventListener("mouseleave", () => {
        resetCard();
    });
    /* MOBILE */
    profileCard.addEventListener(
        "touchmove",
        (e) => {
            const touch = e.touches[0];
            moveCard(
                touch.clientX,
                touch.clientY
            );
        },
        { passive: true }
    );
    profileCard.addEventListener(
        "touchend",
        () => {
            resetCard();
        }
    );
    function resetCard() {
        profileCard.style.transform =
            "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
        profileCard.style.setProperty(
            "--mouse-x",
            "50%"
        );
        profileCard.style.setProperty(
            "--mouse-y",
            "50%"
        );
        profileCard.style.setProperty(
            "--shine-x",
            "50%"
        );
        profileCard.style.setProperty(
            "--shine-y",
            "50%"
        );
    }
}

/* =========================
   SCROLL VELOCITY
========================= */
const velocityTracks =
    document.querySelectorAll(".scroll-velocity-track");
if (velocityTracks.length) {
    let currentX = [0, 0];
    let targetSpeed = 1;
    let currentSpeed = 1;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    function animateVelocity(time) {
        const deltaTime = time - lastTime;
        lastTime = time;
        const scrollY = window.scrollY;
        const scrollDelta = scrollY - lastScrollY;
        lastScrollY = scrollY;
        const scrollSpeed = Math.abs(scrollDelta);
        targetSpeed =
            1 + Math.min(scrollSpeed * 1, 15);
        currentSpeed +=
            (targetSpeed - currentSpeed) * 1, 8;
        velocityTracks.forEach((track, index) => {
            /* first row = left
               second row = right */
            const baseDirection =
                index === 0 ? -1 : 1;
            const direction =
                scrollDelta === 0
                    ? baseDirection
                    : baseDirection * (scrollDelta > 0 ? 1 : -1);
            currentX[index] +=
                direction *
                currentSpeed *
                3 *
                (deltaTime / 16);
            const trackWidth =
                track.scrollWidth / 2;
            if (currentX[index] <= -trackWidth) {
                currentX[index] += trackWidth;
            }
            if (currentX[index] >= 0) {
                currentX[index] -= trackWidth;
            }
            track.style.transform =
                `translate3d(${currentX[index]}px, 0, 0)`;
        });
        requestAnimationFrame(animateVelocity);
    }
    requestAnimationFrame(animateVelocity);
}
const statNumbers = document.querySelectorAll(".stat-number");
statNumbers.forEach((number, index) => {
    const target = Number(number.dataset.target);
    const hasPlus = number.dataset.plus === "true";
    let current = 0;
    // delay before counting
    const delay = 7000 + (index * 2000);
    setTimeout(() => {
        const duration = 2000;
        const stepTime = duration / target;
        const counter = setInterval(() => {
            current++;
            if (current >= target) {
                current = target;
                number.textContent = hasPlus
                    ? `${target}+`
                    : target;
                clearInterval(counter);
            } else {
                number.textContent = current;
            }
        }, stepTime);
    }, delay);
});
const revealElements = document.querySelectorAll(
    "#about h2, " +
    "#about .about-content, " +
    "#about .profile-card-wrapper, " +
    "#about .stat-item, " +
    "#skills h2, " +
    "#skills .card, " +
    "#skills .skill-card, " +
    "#projects h2, " +
    "#projects .card, " +
    "#contact h2, " +
    "#contact p, " +
    "#contact .btn"
);
revealElements.forEach((element) => {
    element.classList.add("scroll-reveal");
    if (
        element.matches("#about .profile-card-wrapper") ||
        element.matches("#skills .card:nth-child(even)") ||
        element.matches("#projects .card:nth-child(even)")
    ) {
        element.classList.add("reveal-right");
    } else {
        element.classList.add("reveal-left");
    }
});
const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    }
);
revealElements.forEach((element) => {
    revealObserver.observe(element);
});
(function () {
    const HOLD_MS = 1500;          // gaano katagal bago mag-open (milliseconds)
    const OPEN_IN_NEW_TAB = true;  // false = sa same tab mag-open
    const SELECTOR = ".social-icon, .btn, .card";
    const NS = "http://www.w3.org/2000/svg";
    const STROKE = 2.5;
    // kunin ang link ng kahon: href, data-href, o <a> sa loob ng card
    function getLink(el) {
        let raw = el.getAttribute("href") || el.dataset.href;
        if (!raw) {
            const inner = el.querySelector("a[href]");
            if (inner) raw = inner.getAttribute("href");
        }
        if (!raw || raw === "#") return null;
        // kung email lang ang nakalagay (walang mailto:), ayusin
        if (/^[^\s@\/]+@[^\s@\/]+\.[^\s@\/]+$/.test(raw)) {
            raw = "mailto:" + raw;
        }
        return raw;
    }
    function openLink(raw) {
        // in-page link (#projects, #contact) -> mag-scroll
        if (raw.startsWith("#")) {
            const target = document.querySelector(raw);
            if (target) target.scrollIntoView({ behavior: "smooth" });
            return;
        }
        // email / tawag -> hindi aalis sa page
        if (raw.startsWith("mailto:") || raw.startsWith("tel:")) {
            window.location.href = raw;
            return;
        }
        const url = new URL(raw, window.location.href).href;
        if (OPEN_IN_NEW_TAB) {
            const win = window.open(url, "_blank");
            if (win) {
                try { win.opener = null; } catch (e) {}
                return;
            }
            // na-block ng browser ang popup -> same tab na lang
        }
        window.location.href = url;
    }
    // gumawa ng ring na sumusunod sa hugis ng kahon (bilog o parihaba)
    function buildRing(el) {
        let svg = el.querySelector(":scope > .hold-ring");
        let rect;
        if (!svg) {
            svg = document.createElementNS(NS, "svg");
            svg.setAttribute("class", "hold-ring");
            svg.setAttribute("aria-hidden", "true");
            rect = document.createElementNS(NS, "rect");
            rect.setAttribute("pathLength", "100");
            svg.appendChild(rect);
            el.appendChild(svg);
        } else {
            rect = svg.firstChild;
        }
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const cs = getComputedStyle(el).borderTopLeftRadius;
        let radius = parseFloat(cs) || 0;
        if (cs.indexOf("%") !== -1) radius = (radius / 100) * w;
        radius = Math.min(radius, w / 2, h / 2);
        svg.setAttribute("viewBox", "0 0 " + w + " " + h);
        rect.setAttribute("x", STROKE / 2);
        rect.setAttribute("y", STROKE / 2);
        rect.setAttribute("width", Math.max(0, w - STROKE));
        rect.setAttribute("height", Math.max(0, h - STROKE));
        rect.setAttribute("rx", Math.max(0, radius - STROKE / 2));
        rect.setAttribute("ry", Math.max(0, radius - STROKE / 2));
    }
    document.querySelectorAll(SELECTOR).forEach((el) => {
        let timer = null;
        let fired = false;
        function reset() {
            clearTimeout(timer);
            timer = null;
            el.classList.remove("holding", "hold-done");
        }
        el.addEventListener("pointerenter", (e) => {
            // hover lang ng mouse (sa phone, tap na lang)
            if (e.pointerType !== "mouse") return;
            if (fired) return;
            const raw = getLink(el);
            if (!raw) return;
            el.classList.add("hold-target");
            buildRing(el);
            el.style.setProperty("--hold-ms", HOLD_MS + "ms");
            // i-restart ang animation
            el.classList.remove("holding", "hold-done");
            void el.offsetWidth;
            el.classList.add("holding");
            timer = setTimeout(() => {
                fired = true;
                el.classList.add("hold-done");
                openLink(raw);
            }, HOLD_MS);
        });
        el.addEventListener("pointerleave", () => {
            fired = false;
            reset();
        });
        // kapag nag-click na mismo, huwag nang hintayin ang ring
        el.addEventListener("pointerdown", () => {
            clearTimeout(timer);
            fired = true;
        });
    });
})();(function () {
    // dito ilagay kung anong mga kahon ang gusto mong may glow
    
    const GLOW_SELECTOR = ".card, #skills .skill-card, .btn.secondary";
    function edgeProximity(el, x, y) {
        const rect = el.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        let kx = Infinity;
        let ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function cursorAngle(el, x, y) {
        const rect = el.getBoundingClientRect();
        const dx = x - rect.width / 2;
        const dy = y - rect.height / 2;
        if (dx === 0 && dy === 0) return 0;
        let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        return degrees;
    }
    document.querySelectorAll(GLOW_SELECTOR).forEach((el) => {
        el.classList.add("bg-glow");
        const edge = document.createElement("span");
        edge.className = "edge-light";
        el.appendChild(edge);
        el.addEventListener("pointermove", (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty(
                "--edge-proximity",
                (edgeProximity(el, x, y) * 100).toFixed(3)
            );
            el.style.setProperty(
                "--cursor-angle",
                cursorAngle(el, x, y).toFixed(3) + "deg"
            );
        });
    });
})();



/* ---------- JhAi ---------- */
(function () {
  const WORKER_URL = "https://jhai.manabatjhai03.workers.dev";
  const DAILY_LIMIT = 20;
  const $ = (id) => document.getElementById(id);
  const toggle = $("jhai-toggle"), panel = $("jhai-panel"), hint = $("jhai-hint"),
        box = $("jhai-messages"), form = $("jhai-form"), input = $("jhai-input"),
        send = $("jhai-send"), chips = $("jhai-chips");
  if (!toggle || !panel) return;

  const KB = [
  // tungkol sa mga kaibigan
  [
    /\b(tanginamo|gagoka|tangaka|suntukantayo?|suntukan|potanginamo|bobo|mandoyarn?)\b/i,
    "Tama ba 'yan? tanong ka lang sir walang personalan iloveyou?"
  ],

  [
    /\b(haha|haha|hahaha|hahahaha|hahahahahaha|lol|lmao|rofl|hehe|hihi)\b/i,
    "hahahahahahahha nakakatuwa ka naman patatak mo sana sa baso!"
  ],

  [
    /\b(miss)\b/i,
    "si Jhai miss niya na yun e, pwede tanong lang? tanong ka lang boy."
  ],


  [
    /\b(sino\s+(ang\s+)?(mga\s+)?kaibigan( niya)?|kaibigan|barkada|day-one|day one|homies|onis)\b/i,
    "ay kilala ko 'yan! ayan ba sila Gabriel, Dre, Arnel, Arkiel, Zhyren, at marami pang iba? tanong ka lang, boy."
  ],

  // tungkol kay jhai
  [
    /\b(sino\s+(si\s+)?jhai|who\s+is\s+jhai|about\s+jhai|jhai)\b/i,
    "Si Jhai Vincent S. Manabat ay isang CCS student at aspiring web developer. Tingnan ang About section para sa buong kwento niya!"
  ],

  // skills
  [
    /\b(skill|tech|stack|language|marunong)\b/i,
    "Check mo ang My Skills section sa taas, nandun lahat ng tech stack niya."
  ],

  // contact
  [
    /\b(contact|email|reach|kontak|hire)\b/i,
    "Pwede mo siyang i-email sa manabatjhai03@gmail.com o i-message sa LinkedIn/GitHub."
  ],

  // projects
  [
    /\b(project|work|gawa)\b/i,
    "Nasa Projects section ang mga gawa niya. Scroll lang pababa!"
  ],

  // location
  [
    /\b(nakitra|bahay|where)\b/i,
    "Palingon/Calzada."
  ]
];

const fallback = (q) => {
  for (const [re, a] of KB) {
    if (re.test(q)) return a;
  }

  return "Pasensya na, under maintenance pa ako. Balik ka na lang mamaya.";
};

  let history = [];
  const today = new Date().toISOString().slice(0, 10);
  const used = () => { try { const d = JSON.parse(localStorage.getItem("jhai-usage")) || {}; return d.day === today ? d.n : 0; } catch (e) { return 0; } };
  const bump = () => { try { localStorage.setItem("jhai-usage", JSON.stringify({ day: today, n: used() + 1 })); } catch (e) {} };

  function addMsg(role, txt) {
    const d = document.createElement("div");
    d.className = "jhai-msg " + role; d.textContent = txt;
    box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
  }
  function showTyping() {
    const d = document.createElement("div");
    d.className = "jhai-msg bot typing"; d.innerHTML = "<i></i><i></i><i></i>";
    box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
  }
  async function ask(q) {
    if (!WORKER_URL || used() >= DAILY_LIMIT) return fallback(q);
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(WORKER_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8) }), signal: ctrl.signal
      });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); bump();
      return j.reply || fallback(q);
    } catch (e) { return fallback(q); } finally { clearTimeout(t); }
  }
  async function handleSend(q) {
    q = q.trim(); if (!q) return;
    addMsg("user", q); history.push({ role: "user", content: q });
    input.value = ""; send.disabled = true;
    const ty = showTyping(); const a = await ask(q);
    ty.remove(); addMsg("bot", a); history.push({ role: "assistant", content: a });
    send.disabled = false; input.focus();
  }
  function setOpen(o) {
    panel.classList.toggle("open", o); toggle.classList.toggle("open", o);
    panel.setAttribute("aria-hidden", !o);
    if (o) { hint.classList.remove("show"); if (!box.children.length) addMsg("bot", "Hi, ako si JhAi ang tutulong sayo!! tanong kalang kahit ano masasagot ko 'yan."); }
  }
  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  form.addEventListener("submit", (e) => { e.preventDefault(); handleSend(input.value); });
  chips.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => handleSend(b.textContent)));
  setTimeout(() => { if (!panel.classList.contains("open")) hint.classList.add("show"); }, 9000);
  setTimeout(() => hint.classList.remove("show"), 18000);
})();


/* CV PREVIEW POPUP */
(() => {
    const modal = document.getElementById("cvModal");
    const openBtn = document.getElementById("openCvBtn");
    const closeBtn = document.getElementById("closeCvBtn");
    const closeFooter = document.getElementById("closeCvFooter");
    const backdrop = document.getElementById("cvBackdrop");

    if (!modal || !openBtn || !closeBtn ||
        !closeFooter || !backdrop) {
        return;
    }

    function openCvModal() {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("cv-modal-open");
        closeBtn.focus();
    }

    function closeCvModal() {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("cv-modal-open");
        openBtn.focus();
    }

    openBtn.addEventListener("click", openCvModal);
    closeBtn.addEventListener("click", closeCvModal);
    closeFooter.addEventListener("click", closeCvModal);
    backdrop.addEventListener("click", closeCvModal);

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("active")
        ) {
            closeCvModal();
        }
    });
})();

/* =====================================================
   CV PREVIEW POP-UP
   - click "View My CV"  -> bubukas agad ang preview
   - hover/hold 1.5s (yung loading ring) -> bubukas din
   - may Download button sa loob ng pop-up
===================================================== */
(function () {
    if (window.__cvPreviewLoaded) return;   // kapag nakadikit nang higit isang beses, isa lang ang tatakbo
    window.__cvPreviewLoaded = true;

    const CV_URL = "Jhai vincent s. manabat.pdf";                 // <-- pangalan ng PDF mo (nasa same folder ng index.html)
    const CV_NAME = "Jhai-Manabat-CV.pdf";   // pangalan ng file kapag dinownload
    const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const btn = document.getElementById("cv-btn");
    if (!btn) return;

    let modal = null;
    let body = null;
    let lastFocus = null;
    let loaded = false;

    function build() {
        modal = document.createElement("div");
        modal.className = "cv-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-label", "CV preview");
        modal.innerHTML =
            '<div class="cv-panel">' +
                '<div class="cv-head">' +
                    '<span class="cv-title">My CV</span>' +
                    '<div class="cv-actions">' +
                        '<a class="cv-action cv-download" href="' + CV_URL + '" download="' + CV_NAME + '">' +
                            '<i class="fa-solid fa-download"></i> Download</a>' +
                        '<a class="cv-action cv-newtab" href="' + CV_URL + '" target="_blank" rel="noopener">' +
                            '<i class="fa-solid fa-up-right-from-square"></i> Open</a>' +
                        '<button type="button" class="cv-close" aria-label="Close preview">&times;</button>' +
                    '</div>' +
                '</div>' +
                '<div class="cv-body"><p class="cv-msg">Loading CV...</p></div>' +
            '</div>';
        document.body.appendChild(modal);
        body = modal.querySelector(".cv-body");

        modal.addEventListener("pointerdown", (e) => {
            if (e.target === modal) close();
        });
        modal.querySelector(".cv-close").addEventListener("click", close);
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // fallback: browser's own PDF viewer
    async function showFrame() {
        let ok = true;
        try {
            const r = await fetch(CV_URL, { method: "HEAD" });
            ok = r.ok;
        } catch (e) { ok = true; }
        if (!ok) {
            body.innerHTML = '<p class="cv-msg">Coming Soon!! <b>' + CV_URL +
                '</b>. Siguraduhing nasa same folder ito ng index.html.</p>';
            return;
        }
        body.innerHTML = '<iframe class="cv-frame" src="' + CV_URL + '#view=FitH" title="CV"></iframe>';
    }

    // pdf.js: gumagana kahit sa phone (hindi lang first page)
    async function renderPdf() {
        if (!window.pdfjsLib) await loadScript(PDFJS);
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const pdf = await window.pdfjsLib.getDocument(CV_URL).promise;
        body.innerHTML = "";
        const width = Math.min(body.clientWidth - 24, 900);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const base = page.getViewport({ scale: 1 });
            const scale = width / base.width;
            const vp = page.getViewport({ scale: scale * ratio });
            const canvas = document.createElement("canvas");
            canvas.className = "cv-page";
            canvas.width = vp.width;
            canvas.height = vp.height;
            canvas.style.width = width + "px";
            canvas.style.height = (vp.height / ratio) + "px";
            body.appendChild(canvas);
            await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        }
    }

    async function load() {
        if (loaded) return;
        loaded = true;
        try {
            await renderPdf();
        } catch (err) {
            await showFrame();
        }
    }

    function onKey(e) {
        if (e.key === "Escape") close();
        if (e.key === "Tab" && modal) {
            const f = modal.querySelectorAll("a[href], button");
            if (!f.length) return;
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }

    function open() {
        if (!modal) build();
        if (modal.classList.contains("open")) return;
        lastFocus = document.activeElement;
        modal.classList.add("open");
        document.documentElement.classList.add("cv-lock");
        document.addEventListener("keydown", onKey);
        modal.querySelector(".cv-close").focus();
        load();
    }

    function close() {
        if (!modal) return;
        modal.classList.remove("open");
        document.documentElement.classList.remove("cv-lock");
        document.removeEventListener("keydown", onKey);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    // click / tap
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        open();
    });

    // hover-hold ring (galing sa script.js) -> pagka-tapos ng ring, may class na "hold-done"
    new MutationObserver(() => {
        if (btn.classList.contains("hold-done")) open();
    }).observe(btn, { attributes: true, attributeFilter: ["class"] });

    window.openCvPreview = open;
})();


/* =====================================================
   CERTIFICATES
   1) fade-in + blur pag nag-scroll
   2) glowing border (BorderGlow) paglapit ng mouse
   3) click = preview pop-up (may Download PDF sa loob)
===================================================== */
(function () {
    if (window.__certsLoaded) return;
    window.__certsLoaded = true;

    const cards = document.querySelectorAll("#certificates .cert-card");
    if (!cards.length) return;

    /* ---------- 1) FADE IN + BLUR ---------- */
    cards.forEach((card) => card.classList.add("cert-pre"));
    const heading = document.querySelector("#certificates h2");
    if (heading) heading.classList.add("cert-pre");

    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            const i = Array.prototype.indexOf.call(cards, el);
            el.style.animationDelay = (i < 0 ? 0 : (i % 3) * 0.15) + "s";
            el.classList.remove("cert-pre");
            el.classList.add("cert-in");
            obs.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    cards.forEach((c) => io.observe(c));
    if (heading) io.observe(heading);

    /* ---------- 2) GLOW ---------- */
    function edgeProximity(el, x, y) {
        const r = el.getBoundingClientRect();
        const cx = r.width / 2, cy = r.height / 2;
        const dx = x - cx, dy = y - cy;
        let kx = Infinity, ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function cursorAngle(el, x, y) {
        const r = el.getBoundingClientRect();
        const dx = x - r.width / 2, dy = y - r.height / 2;
        if (dx === 0 && dy === 0) return 0;
        let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (deg < 0) deg += 360;
        return deg;
    }
    cards.forEach((card) => {
        if (!card.classList.contains("bg-glow")) {
            card.classList.add("bg-glow");
            const edge = document.createElement("span");
            edge.className = "edge-light";
            card.appendChild(edge);
        }
        card.addEventListener("pointermove", (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            card.style.setProperty("--edge-proximity", (edgeProximity(card, x, y) * 100).toFixed(3));
            card.style.setProperty("--cursor-angle", cursorAngle(card, x, y).toFixed(3) + "deg");
        });
    });

    /* ---------- 3) PREVIEW POP-UP ---------- */
    const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    let modal = null, body = null, titleEl = null, dlEl = null, newEl = null;
    let lastFocus = null, token = 0;

    function build() {
        modal = document.createElement("div");
        modal.className = "cv-modal cert-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML =
            '<div class="cv-panel">' +
                '<div class="cv-head">' +
                    '<span class="cv-title"></span>' +
                    '<div class="cv-actions">' +
                        '<a class="cv-action cv-download" href="#" download><i class="fa-solid fa-download"></i> Download</a>' +
                        '<a class="cv-action cv-newtab" href="#" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Open</a>' +
                        '<button type="button" class="cv-close" aria-label="Close preview">&times;</button>' +
                    '</div>' +
                '</div>' +
                '<div class="cv-body"></div>' +
            '</div>';
        document.body.appendChild(modal);
        body = modal.querySelector(".cv-body");
        titleEl = modal.querySelector(".cv-title");
        dlEl = modal.querySelector(".cv-download");
        newEl = modal.querySelector(".cv-newtab");
        modal.addEventListener("pointerdown", (e) => { if (e.target === modal) close(); });
        modal.querySelector(".cv-close").addEventListener("click", close);
    }

    function loadScript(src) {
        return new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = src; s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        });
    }

    async function renderPdf(url, my) {
        if (!window.pdfjsLib) await loadScript(PDFJS);
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const pdf = await window.pdfjsLib.getDocument(url).promise;
        if (my !== token) return;
        body.innerHTML = "";
        const width = Math.min(body.clientWidth - 24, 900);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            if (my !== token) return;
            const base = page.getViewport({ scale: 1 });
            const vp = page.getViewport({ scale: (width / base.width) * ratio });
            const canvas = document.createElement("canvas");
            canvas.className = "cv-page";
            canvas.width = vp.width;
            canvas.height = vp.height;
            canvas.style.width = width + "px";
            canvas.style.height = (vp.height / ratio) + "px";
            body.appendChild(canvas);
            await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        }
    }

    async function fallback(url, img, my) {
        let ok = false;
        try { ok = (await fetch(url, { method: "HEAD" })).ok; } catch (e) { ok = false; }
        if (my !== token) return;
        if (ok) {
            body.innerHTML = '<iframe class="cv-frame" src="' + url + '#view=FitH" title="Certificate"></iframe>';
        } else if (img) {
            body.innerHTML = '<img class="cv-page" src="' + img + '" alt="Certificate">';
        } else {
            body.innerHTML = '<p class="cv-msg">Coming Soon!! <b>' + url + '</b>.</p>';
        }
    }

    function onKey(e) {
        if (e.key === "Escape") close();
    }

    function open(card) {
        if (!modal) build();
        const url = card.dataset.pdf;
        const img = card.querySelector(".cert-img img");
        const title = card.dataset.title || (card.querySelector("h3") || {}).textContent || "Certificate";
        const my = ++token;
        lastFocus = document.activeElement;
        titleEl.textContent = title;
        dlEl.href = url || "#";
        dlEl.setAttribute("download", (title || "certificate").replace(/\s+/g, "-") + ".pdf");
        newEl.href = url || "#";
        body.innerHTML = '<p class="cv-msg">Loading...</p>';
        modal.classList.add("open");
        document.documentElement.classList.add("cv-lock");
        document.addEventListener("keydown", onKey);
        modal.querySelector(".cv-close").focus();
        if (!url) { fallback("", img && img.src, my); return; }
        renderPdf(url, my).catch(() => fallback(url, img && img.getAttribute("src"), my));
    }

    function close() {
        if (!modal) return;
        token++;
        modal.classList.remove("open");
        document.documentElement.classList.remove("cv-lock");
        document.removeEventListener("keydown", onKey);
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    cards.forEach((card) => {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.addEventListener("click", (e) => {
            if (e.target.closest(".cert-dl")) return;   // Download button = download lang
            open(card);
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); }
        });
    });
})();