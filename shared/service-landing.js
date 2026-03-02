/* ============================================
   SERVICE LANDING PAGES JS
   Header hide-on-scroll, reveals, sticky CTA, form submit
   ============================================ */

(function () {
    var lastScroll = 0;
    var header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', function () {
        var scrollY = window.scrollY;
        if (scrollY > 100) {
            header.style.transform = scrollY > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = scrollY;
    }, { passive: true });
})();

(function () {
    var reveals = document.querySelectorAll('.s-reveal');
    if (!reveals.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) {
        observer.observe(el);
    });
})();

/* Sticky CTA bar: show after 500px scroll, hide when final CTA section in view */
(function () {
    var stickyBar = document.getElementById('s-sticky-cta');
    var ctaSection = document.querySelector('.s-cta');
    if (!stickyBar || !ctaSection) return;

    var showAfter = 500;

    var serviceForm = document.getElementById('service-lead-form');

    function updateSticky() {
        var scrollY = window.scrollY;
        var ctaRect = ctaSection.getBoundingClientRect();
        var ctaInView = ctaRect.top < window.innerHeight;
        var formOpen = serviceForm && !serviceForm.classList.contains('collapsed');
        if (scrollY > showAfter && !ctaInView && !formOpen) {
            stickyBar.classList.add('visible');
        } else {
            stickyBar.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', updateSticky, { passive: true });
    window.addEventListener('resize', updateSticky);
    updateSticky();
})();

/* Service landing form — multi-step wizard with GHL + reCAPTCHA v3 */
(function () {
    var form = document.getElementById('service-lead-form');
    if (!form) return;

    var RECAPTCHA_SITE_KEY = '6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX';
    var TOTAL_STEPS = 4;
    var currentStep = 1;

    /* Auto-detect service from URL path (e.g. /google-ads/ → google-ads) */
    var serviceField = form.querySelector('input[name="ktpvKytJ9wXqQSJZXJiY"]');
    if (serviceField && !serviceField.value) {
        serviceField.value = window.location.pathname.split('/').filter(Boolean)[0] || '';
    }

    var revealBtn = document.getElementById('s-form-reveal-btn');
    var progressFill = document.getElementById('progressFill');
    var progressLabel = document.getElementById('progressLabel');
    var submitBtn = form.querySelector('.s-form-submit');
    var successEl = document.getElementById('service-form-success');
    var errorEl = document.getElementById('service-form-error');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* ---------- Reveal Button ---------- */
    if (revealBtn) {
        revealBtn.addEventListener('click', function () {
            revealBtn.classList.add('hidden');
            form.classList.remove('collapsed');
            form.classList.add('expanding');
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    /* ---------- Step Navigation ---------- */
    function showStep(n) {
        form.querySelectorAll('.form-step').forEach(function (el) {
            el.classList.remove('active');
        });
        var target = form.querySelector('[data-step="' + n + '"]');
        if (target) target.classList.add('active');
        currentStep = n;
        updateProgress();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateProgress() {
        if (progressFill) progressFill.style.width = ((currentStep / TOTAL_STEPS) * 100) + '%';
        if (progressLabel) progressLabel.textContent = 'Step ' + currentStep + ' of ' + TOTAL_STEPS;
    }

    function nextStep() {
        if (!validateStep(currentStep)) return;
        if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
    }

    function prevStep() {
        if (currentStep > 1) showStep(currentStep - 1);
    }

    /* Wire up all Next/Back buttons */
    form.querySelectorAll('.form-btn-next').forEach(function (btn) {
        btn.addEventListener('click', nextStep);
    });
    form.querySelectorAll('.form-btn-back').forEach(function (btn) {
        btn.addEventListener('click', prevStep);
    });

    /* ---------- Error Helpers ---------- */
    function clearStepErrors(stepEl) {
        stepEl.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });
        stepEl.querySelectorAll('.field-error').forEach(function (el) { el.classList.remove('visible'); });
        stepEl.querySelectorAll('.group-error').forEach(function (el) { el.classList.remove('visible'); });
        stepEl.querySelectorAll('.radio-group.error, .checkbox-group.error').forEach(function (el) { el.classList.remove('error'); });
    }

    function showFieldError(input, message) {
        input.classList.add('error');
        var errEl = input.parentNode.querySelector('.field-error');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.add('visible');
        }
    }

    function showGroupError(groupEl, message) {
        groupEl.classList.add('error');
        var errEl = groupEl.querySelector('.group-error');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.add('visible');
        }
    }

    /* ---------- Per-Step Validation ---------- */
    function validateStep(stepNum) {
        var stepEl = form.querySelector('[data-step="' + stepNum + '"]');
        if (!stepEl) return true;
        clearStepErrors(stepEl);
        var valid = true;

        /* Required text/email/tel/url inputs */
        stepEl.querySelectorAll('input[required]').forEach(function (input) {
            if (input.type === 'radio' || input.type === 'checkbox') return;
            if (!input.value.trim()) {
                showFieldError(input, 'This field is required.');
                valid = false;
            } else if (input.type === 'email' && !emailRe.test(input.value.trim())) {
                showFieldError(input, 'Please enter a valid email.');
                valid = false;
            }
        });

        /* Required textareas */
        stepEl.querySelectorAll('textarea[required]').forEach(function (ta) {
            if (!ta.value.trim()) {
                showFieldError(ta, 'This field is required.');
                valid = false;
            }
        });

        /* Required selects */
        stepEl.querySelectorAll('select[required]').forEach(function (sel) {
            if (!sel.value) {
                sel.classList.add('error');
                showFieldError(sel, 'Please select an option.');
                valid = false;
            }
        });

        /* Required radio groups */
        stepEl.querySelectorAll('.radio-group[data-required="true"]').forEach(function (group) {
            var checked = group.querySelector('input[type="radio"]:checked');
            if (!checked) {
                showGroupError(group, 'Please select an option.');
                valid = false;
            }
        });

        /* Required checkbox groups */
        stepEl.querySelectorAll('.checkbox-group[data-required="true"]').forEach(function (group) {
            var checked = group.querySelectorAll('input[type="checkbox"]:checked');
            if (!checked.length) {
                showGroupError(group, 'Please select at least one option.');
                valid = false;
            }
        });

        /* Conditional field: only validate if visible */
        stepEl.querySelectorAll('.form-conditional').forEach(function (cond) {
            if (!cond.classList.contains('visible')) return;
            cond.querySelectorAll('textarea').forEach(function (ta) {
                if (!ta.value.trim()) {
                    showFieldError(ta, 'This field is required.');
                    valid = false;
                }
            });
        });

        return valid;
    }

    /* ---------- Conditional Logic: Decision Maker ---------- */
    var decisionRadios = form.querySelectorAll('input[name="66z3ZDyii7XjkddqNebS"]');
    var decisionExplain = document.getElementById('decision-maker-explain');
    decisionRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (decisionExplain) {
                if (this.value === 'No') {
                    decisionExplain.classList.add('visible');
                } else {
                    decisionExplain.classList.remove('visible');
                    var ta = decisionExplain.querySelector('textarea');
                    if (ta) ta.value = '';
                }
            }
        });
    });

    /* ---------- Clear errors on interaction ---------- */
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
        var evtType = (el.type === 'radio' || el.type === 'checkbox') ? 'change' : 'input';
        el.addEventListener(evtType, function () {
            this.classList.remove('error');
            var fieldErr = this.parentNode.querySelector('.field-error');
            if (fieldErr) fieldErr.classList.remove('visible');
            /* Clear group error for radio/checkbox */
            var group = this.closest('.radio-group, .checkbox-group');
            if (group) {
                group.classList.remove('error');
                var gErr = group.querySelector('.group-error');
                if (gErr) gErr.classList.remove('visible');
            }
        });
    });

    /* ---------- Form Submission ---------- */
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        if (errorEl) errorEl.style.display = 'none';

        try {
            var captchaToken = '';
            if (window.grecaptcha) {
                captchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
            }

            /* Build form data — aggregate checkbox groups as comma-separated */
            var formDataObj = {};
            var raw = new FormData(form);

            /* Collect all unique field names */
            var checkboxNames = {};
            form.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(function (cb) {
                checkboxNames[cb.name] = true;
            });

            /* Process non-checkbox fields first */
            raw.forEach(function (value, key) {
                if (!checkboxNames[key]) {
                    formDataObj[key] = value;
                }
            });

            /* Aggregate checkbox groups */
            Object.keys(checkboxNames).forEach(function (name) {
                var checked = form.querySelectorAll('input[name="' + name + '"]:checked');
                var values = [];
                checked.forEach(function (cb) { values.push(cb.value); });
                if (values.length) formDataObj[name] = values.join(', ');
            });

            /* Remove conditional fields if hidden */
            if (decisionExplain && !decisionExplain.classList.contains('visible')) {
                var condTa = decisionExplain.querySelector('textarea');
                if (condTa) delete formDataObj[condTa.name];
            }

            /* Compute lead score before submission (available for routing after) */
            var leadScore = window.VantageLeadScoring
                ? window.VantageLeadScoring.computeLeadScore(formDataObj) : 0;

            var payload = new FormData();
            payload.set('formData', JSON.stringify(formDataObj));
            payload.set('captchaV3', captchaToken);

            var res = await fetch('https://backend.leadconnectorhq.com/forms/submit', {
                method: 'POST',
                body: payload
            });
            var json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Submission failed');

            form.style.display = 'none';

            /* Route qualified leads to booking, others see confirmation */
            if (window.VantageLeadScoring && window.VantageLeadScoring.isQualified(leadScore)) {
                setTimeout(function () { window.location.href = '/booking/'; }, 800);
            } else {
                if (successEl) successEl.style.display = 'flex';
            }
        } catch (err) {
            console.error('Form submission error:', err);
            if (errorEl) errorEl.style.display = 'flex';
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
})();

/* Vanta.js TRUNK background in hero (same as main site hero) */
(function () {
    var el = document.getElementById('s-vantaBg');
    if (!el) return;

    var effect = null;

    function loadScript(src, cb) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        document.body.appendChild(s);
    }

    function initVanta() {
        if (effect || typeof VANTA === 'undefined') return;
        effect = VANTA.TRUNK({
            el: '#s-vantaBg',
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1.5,
            scaleMobile: 1.5,
            color: 0x14b1ab,
            backgroundColor: 0xffffff,
            spacing: 5,
            chaos: 8,
            speed: 0.2
        });
        setTimeout(function () {
            if (effect && effect.camera) effect.camera.position.y = 150;
        }, 100);
    }

    function start() {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js', function () {
            loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.trunk.min.js', initVanta);
        });
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(start);
    } else {
        setTimeout(start, 100);
    }
})();
