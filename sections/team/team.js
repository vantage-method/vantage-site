/* ============================================
   TEAM SECTION JS
   JS-driven orbit animation for reliable touch
   detection on Mobile Safari, bio panel,
   connection line, scroll reveal
   ============================================ */

(function () {
    const stage    = document.getElementById('tmOrbitStage');
    const header   = document.querySelector('.tm-header');
    const ring     = document.getElementById('tmRing');
    const canvas   = document.getElementById('tmConnectionCanvas');
    const panel    = document.getElementById('tmPanel');
    const closeBtn = document.getElementById('tmPanelClose');
    if (!stage || !ring || !canvas || !panel) return;

    const ctx     = canvas.getContext('2d');
    const members = ring.querySelectorAll('.tm-member');
    const inners  = ring.querySelectorAll('.tm-inner');

    /* ---- JS-driven orbit state ---- */
    var ringAngle = 0;          // degrees, 0–360
    var isPaused  = false;
    var lastTime  = 0;
    var ORBIT_DURATION = 55000; // ms per full revolution (matches original 55s)

    /* ---- Canvas sizing (DPR-aware for Retina) ---- */
    let canvasW = 0, canvasH = 0;

    function resize() {
        var r   = stage.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvasW = r.width;
        canvasH = r.height;
        canvas.width  = canvasW * dpr;
        canvas.height = canvasH * dpr;
        canvas.style.width  = canvasW + 'px';
        canvas.style.height = canvasH + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---- Scroll reveal ---- */
    let headerRevealed = false;
    let stageRevealed  = false;

    function reveal() {
        const vh = window.innerHeight;
        if (header && !headerRevealed) {
            if (header.getBoundingClientRect().top < vh * 0.85) {
                header.classList.add('visible');
                headerRevealed = true;
            }
        }
        if (!stageRevealed) {
            if (stage.getBoundingClientRect().top < vh * 0.78) {
                stage.classList.add('visible');
                stageRevealed = true;
            }
        }
    }
    window.addEventListener('scroll', reveal, { passive: true });
    reveal();

    /* ---- Get a member's current visual center (stage-relative) ---- */
    function getMemberPos(member) {
        var mr = member.getBoundingClientRect();
        var sr = stage.getBoundingClientRect();
        return {
            x: (mr.left + mr.width / 2) - sr.left,
            y: (mr.top + mr.height / 2) - sr.top
        };
    }

    /* ---- Combined animation loop: orbit rotation + connection line ---- */
    let activeMember = null;
    let lineAlpha    = 0;

    function drawFrame(now) {
        /* ---- Orbit animation (JS-driven) ---- */
        if (lastTime === 0) lastTime = now;
        var dt = now - lastTime;
        lastTime = now;

        if (!isPaused) {
            ringAngle = (ringAngle + (dt / ORBIT_DURATION) * 360) % 360;
        }

        /* Apply ring rotation via JS transform */
        ring.style.transform = 'translate(-50%, -50%) rotate(' + ringAngle + 'deg)';

        /* Counter-rotate each member's inner to keep content upright (angle step = 360 / count) */
        var angleStep = 360 / (members.length || 1);
        for (var i = 0; i < inners.length; i++) {
            inners[i].style.transform = 'rotate(' + -(ringAngle + i * angleStep) + 'deg)';
        }

        /* ---- Connection line ---- */
        ctx.clearRect(0, 0, canvasW, canvasH);

        var cx = canvasW / 2;
        var cy = canvasH / 2;

        if (activeMember) {
            lineAlpha = Math.min(lineAlpha + 0.08, 1);
        } else {
            lineAlpha = Math.max(lineAlpha - 0.06, 0);
        }

        if (lineAlpha > 0 && activeMember) {
            var pos = getMemberPos(activeMember);
            var mx  = pos.x;
            var my  = pos.y;

            var grad = ctx.createLinearGradient(cx, cy, mx, my);
            grad.addColorStop(0, 'rgba(0, 124, 135, 0)');
            grad.addColorStop(0.3, 'rgba(0, 124, 135, ' + (0.5 * lineAlpha) + ')');
            grad.addColorStop(1, 'rgba(0, 124, 135, ' + (0.7 * lineAlpha) + ')');

            ctx.save();
            ctx.strokeStyle = grad;
            ctx.lineWidth   = 2;
            ctx.shadowColor = 'rgba(0, 124, 135, 0.6)';
            ctx.shadowBlur  = 14 * lineAlpha;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(mx, my);
            ctx.stroke();

            ctx.fillStyle = 'rgba(0, 124, 135, ' + lineAlpha + ')';
            ctx.beginPath();
            ctx.arc(mx, my, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);

    /* ---- Detect mobile (panel goes below) ---- */
    function isMobileLayout() {
        return window.innerWidth <= 1100;
    }

    /* ---- FLIP helper: smoothly animate the stage's lateral shift ---- */
    function flipStage(action) {
        if (isMobileLayout()) { action(); return; }

        var beforeX = stage.getBoundingClientRect().left;
        action();
        var afterX = stage.getBoundingClientRect().left;
        var dx = beforeX - afterX;

        if (dx === 0) return;

        /* Invert: instantly place the stage at its old position */
        stage.style.transition = 'none';
        stage.style.transform = 'translateX(' + dx + 'px)';

        /* Force the browser to paint the inverted position */
        stage.offsetHeight;

        /* Play: animate to the final position */
        stage.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        stage.style.transform = 'translateX(0)';

        /* Clean up inline styles when done */
        stage.addEventListener('transitionend', function cleanup(e) {
            if (e.propertyName === 'transform') {
                stage.style.transition = '';
                stage.style.transform = '';
                stage.removeEventListener('transitionend', cleanup);
            }
        });
    }

    /* ---- Open expanded panel ---- */
    function openPanel(member) {
        if (activeMember === member) {
            closePanel();
            return;
        }

        members.forEach(m => m.classList.remove('active'));

        activeMember = member;
        isPaused = true;
        ring.classList.add('paused');
        member.classList.add('active');

        var img = member.dataset.img;
        document.getElementById('tmPanelPhoto').style.backgroundImage = "url('" + img + "')";
        document.getElementById('tmPanelName').textContent = member.dataset.name;
        document.getElementById('tmPanelRole').textContent = member.dataset.title;
        document.getElementById('tmPanelBio').textContent  = member.dataset.bio;

        flipStage(function () { panel.classList.add('open'); });

        if (isMobileLayout()) {
            setTimeout(function () {
                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    /* ---- Close expanded panel ---- */
    function closePanel() {
        /* Cancel any in-progress FLIP animation */
        stage.style.transition = '';
        stage.style.transform = '';

        members.forEach(m => m.classList.remove('active'));

        flipStage(function () { panel.classList.remove('open'); });

        isPaused = false;
        ring.classList.remove('paused');

        if (isMobileLayout()) {
            setTimeout(function () {
                stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }

        activeMember = null;
    }

    /* ---- Event listeners ---- */

    /*
       Hit detection uses getBoundingClientRect() on each member to find
       the closest one to the tap/click point. With JS-driven transforms,
       getBoundingClientRect() returns the actual rendered position on ALL
       browsers, including Mobile Safari (which previously returned stale
       positions for CSS-animated transforms running on the compositor).
    */

    /* Disable member pointer-events on touch devices to prevent
       stale hit regions from intercepting touches */
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        members.forEach(function (m) { m.style.pointerEvents = 'none'; });
    }

    var handledByTouch = false;

    function hitTestOrbit(clientX, clientY) {
        var bestIdx  = -1;
        var bestDist = Infinity;

        for (var i = 0; i < members.length; i++) {
            var rect = members[i].getBoundingClientRect();
            var mcx  = rect.left + rect.width / 2;
            var mcy  = rect.top  + rect.height / 2;
            var dx   = clientX - mcx;
            var dy   = clientY - mcy;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < bestDist) {
                bestDist = dist;
                bestIdx  = i;
            }
        }

        /* Only select if tap was within reasonable distance of a member */
        var maxDist = (window.innerWidth <= 480) ? 40 : (window.innerWidth <= 768) ? 50 : 55;
        if (bestIdx >= 0 && bestDist < maxDist) return bestIdx;
        return -1;
    }

    /* --- Touch: track start position to detect taps vs scrolls --- */
    var touchStartX = 0, touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        var touch = e.changedTouches[0];

        /* Ignore scrolls/swipes */
        if (Math.abs(touch.clientX - touchStartX) > 10 ||
            Math.abs(touch.clientY - touchStartY) > 10) return;

        /* Ignore taps on panel or close button */
        if (e.target.closest('.tm-panel-close')) return;
        if (e.target.closest('.tm-panel')) return;

        /* Check if tap is within the orbit stage area */
        var stageRect = stage.getBoundingClientRect();
        if (touch.clientX < stageRect.left || touch.clientX > stageRect.right ||
            touch.clientY < stageRect.top  || touch.clientY > stageRect.bottom) {
            if (activeMember) closePanel();
            return;
        }

        /* Proximity-based hit test using actual rendered positions */
        var idx = hitTestOrbit(touch.clientX, touch.clientY);
        if (idx >= 0) {
            e.preventDefault();
            handledByTouch = true;
            openPanel(members[idx]);
        }
    });

    /* --- Click: desktop mouse fallback --- */
    stage.addEventListener('click', function (e) {
        if (handledByTouch) { handledByTouch = false; return; }
        if (e.target.closest('.tm-panel') || e.target.closest('.tm-panel-close')) return;

        var idx = hitTestOrbit(e.clientX, e.clientY);
        if (idx >= 0) {
            e.stopPropagation();
            openPanel(members[idx]);
        }
    });

    /* Close button */
    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        });
    }

    /* Click outside to close (desktop) */
    document.addEventListener('click', function (e) {
        if (activeMember && !e.target.closest('.tm-member') && !e.target.closest('.tm-panel') && !e.target.closest('.tm-orbit-stage')) {
            closePanel();
        }
    });
})();
