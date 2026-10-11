(function () {
    const screen = document.getElementById("loading-screen");
    const canvas = document.getElementById("tide-canvas");
    if (!screen || !canvas) return;

    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- settings (pwede mong baguhin) ----------
    const FONT_SIZE = 12;
    const CHARS = " .:~+*#%@";
    const PERIOD = 9;
    const LEVEL = 0.5;
    const RANGE = 0.16;
    const SCALE = 300;
    const SEED = 7;
    const FPS = 30;
    const CENTER_DIM = 0.3;

    // mouse
    const WAKE_RADIUS = 80;
    const WAKE_STRENGTH = 0.12;
    const WAKE_LENGTH = 1.8;

    // click ripples
    const RIPPLE_SPEED = 330;
    const RIPPLE_LIFE = 2.4;
    const MAX_RIPPLES = 8;
    const AUTO_DROPS = true;
    const AUTO_EVERY = 1500;

    const COLORS = {
        dark:  { water: [110, 120, 255], foam: [255, 159, 252], sand: [190, 195, 230] },
        light: { water: [82, 39, 255],   foam: [192, 38, 211],  sand: [20, 20, 30] }
    };

    const CELL_W = FONT_SIZE * 0.6;
    const CELL_H = FONT_SIZE;
    const ALPHA_STEPS = 8;

    let w = 0, h = 0, cols = 0, rows = 0, dpr = 1;
    let heights = null;
    let wake = null;
    let ripples = [];
    let rafId = null;
    let stopped = false;

    function hash(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7 + SEED * 17.0) * 43758.5453;
        return n - Math.floor(n);
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function vnoise(x, y) {
        const xi = Math.floor(x), yi = Math.floor(y);
        const xf = x - xi, yf = y - yi;
        const a = hash(xi, yi), b = hash(xi + 1, yi);
        const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
        const u = smooth(xf), v = smooth(yf);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y) {
        let sum = 0, amp = 0.5, freq = 1;
        for (let i = 0; i < 4; i++) {
            sum += amp * vnoise(x * freq, y * freq);
            freq *= 2;
            amp *= 0.5;
        }
        return Math.min(1, Math.max(0, (sum - 0.2) / 0.6));
    }

    function smoothstep(a, b, x) {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = screen.clientWidth;
        h = screen.clientHeight;

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cols = Math.ceil(w / CELL_W);
        rows = Math.ceil(h / CELL_H);

        heights = new Float32Array(cols * rows);
        wake = new Float32Array(cols * rows);
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                heights[j * cols + i] = fbm((i * CELL_W) / SCALE, (j * CELL_H) / SCALE);
            }
        }

        if (reduceMotion || stopped) draw(PERIOD * 0.3);
    }

    // ---------- interaction ----------
    function nowSec() { return (performance.now() - t0) / 1000; }

    function addRipple(x, y) {
        ripples.push({ x: x, y: y, t: nowSec() });
        if (ripples.length > MAX_RIPPLES) ripples.shift();
    }

    function stamp(px, py) {
        const ci = px / CELL_W, cj = py / CELL_H;
        const rc = Math.ceil(WAKE_RADIUS / CELL_W) + 1;
        const rr = Math.ceil(WAKE_RADIUS / CELL_H) + 1;
        const j0 = Math.max(0, Math.floor(cj) - rr), j1 = Math.min(rows - 1, Math.ceil(cj) + rr);
        const i0 = Math.max(0, Math.floor(ci) - rc), i1 = Math.min(cols - 1, Math.ceil(ci) + rc);

        for (let j = j0; j <= j1; j++) {
            for (let i = i0; i <= i1; i++) {
                const dx = i * CELL_W + CELL_W / 2 - px;
                const dy = j * CELL_H + CELL_H / 2 - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < WAKE_RADIUS) {
                    const v = smooth(1 - dist / WAKE_RADIUS);
                    const k = j * cols + i;
                    if (v > wake[k]) wake[k] = v;
                }
            }
        }
    }

    let lastPX = null, lastPY = null;

    function localXY(e) {
        const r = screen.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    }

    function onMove(e) {
        const p = localXY(e);
        const x = p[0], y = p[1];
        if (lastPX === null) {
            stamp(x, y);
        } else {
            const dx = x - lastPX, dy = y - lastPY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.max(1, Math.ceil(dist / (WAKE_RADIUS * 0.35)));
            for (let s = 1; s <= steps; s++) {
                stamp(lastPX + (dx * s) / steps, lastPY + (dy * s) / steps);
            }
        }
        lastPX = x;
        lastPY = y;
    }

    function onLeave() { lastPX = null; lastPY = null; }

    function onDown(e) {
        const p = localXY(e);
        addRipple(p[0], p[1]);
        stamp(p[0], p[1]);
    }

    // ---------- drawing ----------
    let lastKey = "";
    function setFill(rgb, alpha) {
        const a = Math.max(1, Math.min(ALPHA_STEPS, Math.round(alpha * ALPHA_STEPS)));
        const key = rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a;
        if (key !== lastKey) {
            ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (a / ALPHA_STEPS).toFixed(3) + ")";
            lastKey = key;
        }
    }

    function draw(t) {
        const light = document.body.classList.contains("light-mode");
        const pal = light ? COLORS.light : COLORS.dark;

        ctx.clearRect(0, 0, w, h);
        ctx.font = FONT_SIZE + "px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
        ctx.textBaseline = "top";
        lastKey = "";

        const TAU = Math.PI * 2;
        const level = LEVEL + RANGE * Math.sin((TAU * t) / PERIOD - Math.PI / 2);
        const lagLevel = LEVEL + RANGE * Math.sin((TAU * (t - 1.6)) / PERIOD - Math.PI / 2);
        const wetLevel = Math.max(level, lagLevel);
        const maxIdx = CHARS.length - 1;

        const cx = w / 2, cy = h / 2;
        const rx = Math.max(220, w * 0.28), ry = Math.max(130, h * 0.22);

        const rs = [];
        for (let q = 0; q < ripples.length; q++) {
            const rp = ripples[q];
            const age = t - rp.t;
            if (age < 0 || age > RIPPLE_LIFE) continue;
            rs.push({
                x: rp.x, y: rp.y, age: age,
                r1: age * RIPPLE_SPEED,
                r2: age * RIPPLE_SPEED * 0.62,
                amp: Math.exp(-age * 1.3)
            });
        }
        const rc = rs.length;

        for (let j = 0; j < rows; j++) {
            const y = j * CELL_H;
            const dyN = (y - cy) / ry;

            for (let i = 0; i < cols; i++) {
                const x = i * CELL_W;
                const k = j * cols + i;
                const hh = heights[k];
                const wk = wake[k];

                let rip = 0;
                for (let q = 0; q < rc; q++) {
                    const rp = rs[q];
                    const dx = x + CELL_W / 2 - rp.x;
                    const dy = y + CELL_H / 2 - rp.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const df = dist - rp.r1;
                    if (df > -70 && df < 70) rip += rp.amp * Math.exp(-(df * df) / 1152);

                    const df2 = dist - rp.r2;
                    if (df2 > -50 && df2 < 50) rip += rp.amp * 0.55 * Math.exp(-(df2 * df2) / 512);

                    if (rp.age < 0.3 && dist < 38) rip += 1 - rp.age / 0.3;
                }
                if (rip > 1.4) rip = 1.4;

                const d = level - hh + wk * WAKE_STRENGTH + rip * 0.1;
                let idx = 0, color = null, alpha = 0;

                if (d > 0) {
                    const wave = Math.sin(d * 38 - t * 2.4 + hh * 9) * 0.5 + 0.5;
                    const calm = Math.min(d * 3, 1);
                    const base = 0.22 + 0.55 * wave * (1 - 0.55 * calm);
                    idx = Math.round(base * maxIdx);
                    color = pal.water;
                    alpha = 0.35 + 0.5 * base;

                    if (d < 0.035) {
                        const f = 1 - d / 0.035;
                        idx = Math.max(idx, Math.round((0.55 + 0.45 * f) * maxIdx));
                        color = pal.foam;
                        alpha = 0.55 + 0.45 * f;
                    }
                } else if (hh < wetLevel) {
                    idx = 2;
                    color = pal.sand;
                    alpha = 0.3;
                } else {
                    const m = (hh * 14) % 1;
                    if (m < 0.07 && d < -0.02) {
                        idx = 1;
                        color = pal.sand;
                        alpha = 0.4;
                    }
                }

                const boost = Math.max(wk, Math.min(1, rip));
                if (boost > 0.1 && d > 0) {
                    idx = Math.max(idx, Math.round((0.45 + 0.55 * boost) * maxIdx));
                    color = boost > 0.45 ? pal.foam : pal.water;
                    alpha = Math.max(alpha, 0.45 + 0.5 * boost);
                }

                if (idx === 0 || !color) continue;

                const dxN = (x - cx) / rx;
                const r = Math.sqrt(dxN * dxN + dyN * dyN);
                const dim = CENTER_DIM + (1 - CENTER_DIM) * smoothstep(0.4, 1.3, r);
                const a = alpha * (dim + (1 - dim) * Math.min(1, boost * 1.6));
                if (a < 0.06) continue;

                setFill(color, a);
                ctx.fillText(CHARS[idx], x, y);
            }
        }
    }

    // ---------- loop ----------
    const t0 = performance.now();
    let lastFrame = 0;
    let lastAuto = 0;

    function loop(now) {
        if (stopped) return;
        rafId = requestAnimationFrame(loop);
        if (now - lastFrame < 1000 / FPS) return;
        const dt = Math.min((now - lastFrame) / 1000, 0.1);
        lastFrame = now;

        const decay = Math.exp(-dt / (WAKE_LENGTH / 3));
        for (let k = 0; k < wake.length; k++) {
            const v = wake[k] * decay;
            wake[k] = v < 0.01 ? 0 : v;
        }

        if (AUTO_DROPS && now - t0 > 500 && now - lastAuto > AUTO_EVERY) {
            lastAuto = now;
            addRipple(w * (0.12 + Math.random() * 0.76), h * (0.12 + Math.random() * 0.76));
        }

        draw((now - t0) / 1000);
    }

    function stop() {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
        draw(PERIOD * 0.3);
        stopped = true;
    } else {
        screen.addEventListener("pointermove", onMove);
        screen.addEventListener("pointerleave", onLeave);
        screen.addEventListener("pointerdown", onDown);
        rafId = requestAnimationFrame(loop);
    }

    new MutationObserver(() => {
        if (screen.classList.contains("hide")) {
            setTimeout(stop, 1200);
        }
    }).observe(screen, { attributes: true, attributeFilter: ["class"] });
})();