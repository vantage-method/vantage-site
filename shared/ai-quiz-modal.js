/* ============================================
   AI QUIZ MODAL — MODULE
   State machine, triggers, suppression, form,
   accessibility, analytics
   ============================================ */
(function () {
    'use strict';

    var CFG = window.AI_QUIZ_CONFIG;
    if (!CFG || !CFG.QUIZ_ENABLED) return;

    var STATES = { INTRO: 'intro', QUESTION: 'question', GATE: 'gate', RESULTS: 'results', EVAL: 'eval', EVAL_SUCCESS: 'eval_success' };
    var state = STATES.INTRO;
    var currentQ = 0;
    var answers = [];
    var overlay, modal, focusTrap, bubbleEl;
    var gateData = {};
    var quizScore = 0;
    var quizLevel = null;

    /* ---- Suppression helpers ---- */
    function isSuppressed() {
        try {
            var closed = localStorage.getItem('ai_quiz_closed');
            var submitted = localStorage.getItem('ai_quiz_submitted');
            var now = Date.now();
            if (submitted) {
                var diff = (now - Number(submitted)) / 86400000;
                if (diff < CFG.SUPPRESS_DAYS_AFTER_SUBMIT) return true;
            }
            if (closed) {
                var diff2 = (now - Number(closed)) / 86400000;
                if (diff2 < CFG.SUPPRESS_DAYS_AFTER_CLOSE) return true;
            }
        } catch (e) { /* localStorage unavailable */ }
        return false;
    }

    function setSuppression(key) {
        try { localStorage.setItem(key, String(Date.now())); } catch (e) {}
    }

    /* ---- Analytics ---- */
    function fireEvent(name, params) {
        params = params || {};
        if (window.dataLayer) {
            window.dataLayer.push(Object.assign({ event: name }, params));
        } else if (window.gtag) {
            window.gtag('event', name, params);
        }
    }

    /* ---- UTM helpers ---- */
    function getUTMs() {
        var sp = new URLSearchParams(window.location.search);
        return {
            utmSource: sp.get('utm_source') || '',
            utmMedium: sp.get('utm_medium') || '',
            utmCampaign: sp.get('utm_campaign') || '',
            utmTerm: sp.get('utm_term') || '',
            utmContent: sp.get('utm_content') || ''
        };
    }

    /* ---- Scoring ---- */
    function computeScore() {
        var total = 0;
        for (var i = 0; i < answers.length; i++) total += answers[i];
        return total;
    }

    function getLevel(score) {
        for (var i = 0; i < CFG.LEVEL_RANGES.length; i++) {
            var r = CFG.LEVEL_RANGES[i];
            if (score >= r.min && score <= r.max) return r;
        }
        return CFG.LEVEL_RANGES[CFG.LEVEL_RANGES.length - 1];
    }

    /* ---- SVG icons (inlined to avoid external deps) ---- */
    var ICONS = {
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
        zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.5"/><polyline points="8 4.5 8 8 10.5 9.5"/></svg>',
        questions: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="5" y1="6" x2="11" y2="6"/><line x1="5" y1="10" x2="9" y2="10"/></svg>'
    };

    /* ---- Build overlay + modal shell ---- */
    function buildShell() {
        overlay = document.createElement('div');
        overlay.className = 'ai-quiz-overlay';
        overlay.id = 'ai-quiz-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'ai-quiz-title');

        modal = document.createElement('div');
        modal.className = 'ai-quiz-modal';
        modal.setAttribute('tabindex', '-1');

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });
    }

    /* ---- Render helpers ---- */
    function render(html) {
        modal.innerHTML = closeBtnHTML() + html;
        modal.focus();
        bindScreen();
    }

    function bindScreen() {
        var closeBtn = modal.querySelector('.ai-quiz-close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        if (state === STATES.INTRO) {
            var startBtn = modal.querySelector('.ai-quiz-start');
            if (startBtn) startBtn.addEventListener('click', function () {
                currentQ = 0;
                answers = [];
                state = STATES.QUESTION;
                renderQuestion();
                fireEvent('ai_quiz_started');
            });
        }

        if (state === STATES.QUESTION) {
            var answerBtns = modal.querySelectorAll('.ai-quiz-answer');
            for (var i = 0; i < answerBtns.length; i++) {
                (function (idx) {
                    answerBtns[idx].addEventListener('click', function () {
                        var val = parseInt(this.getAttribute('data-value'), 10);
                        answers[currentQ] = val;
                        if (currentQ < CFG.QUESTIONS.length - 1) {
                            currentQ++;
                            renderQuestion();
                        } else {
                            state = STATES.GATE;
                            renderGate();
                            fireEvent('ai_quiz_completed');
                        }
                    });
                })(i);
            }

            var backBtn = modal.querySelector('.ai-quiz-back');
            if (backBtn) backBtn.addEventListener('click', function () {
                if (currentQ > 0) {
                    currentQ--;
                    renderQuestion();
                } else {
                    state = STATES.INTRO;
                    renderIntro();
                }
            });
        }

        if (state === STATES.GATE) {
            var form = modal.querySelector('.ai-quiz-gate-form');
            if (form) form.addEventListener('submit', handleGateSubmit);
        }

        if (state === STATES.RESULTS) {
            var evalBtn = modal.querySelector('.ai-quiz-eval-btn');
            if (evalBtn) evalBtn.addEventListener('click', function () {
                renderEvalForm();
            });
        }

        if (state === STATES.EVAL) {
            var evalForm = modal.querySelector('.ai-quiz-eval-form');
            if (evalForm) evalForm.addEventListener('submit', handleEvalSubmit);
        }

        setupFocusTrap();
    }

    /* ---- Close button HTML ---- */
    function closeBtnHTML() {
        return '<button class="ai-quiz-close" aria-label="Close quiz">' + ICONS.close + '</button>';
    }

    /* ---- INTRO ---- */
    function renderIntro() {
        state = STATES.INTRO;
        render(
            '<div class="ai-quiz-screen ai-quiz-intro">' +
                '<div class="ai-quiz-intro-icon">' + ICONS.zap + '</div>' +
                '<h2 id="ai-quiz-title">How AI-Ready Is<br>Your Business?</h2>' +
                '<p>Answer 10 quick questions and get a personalised AI maturity score — plus a clear next step.</p>' +
                '<div class="ai-quiz-intro-meta">' +
                    '<span>' + ICONS.clock + ' 2 min</span>' +
                    '<span>' + ICONS.questions + ' 10 questions</span>' +
                '</div>' +
                '<button class="ai-quiz-btn ai-quiz-start">Start the Diagnostic</button>' +
            '</div>'
        );
    }

    /* ---- QUESTION ---- */
    function renderQuestion() {
        state = STATES.QUESTION;
        var q = CFG.QUESTIONS[currentQ];
        var pct = Math.round(((currentQ) / CFG.QUESTIONS.length) * 100);
        var letters = ['A', 'B', 'C', 'D'];

        var answersHTML = '';
        for (var i = 0; i < q.answers.length; i++) {
            answersHTML +=
                '<button class="ai-quiz-answer" data-value="' + q.answers[i].value + '">' +
                    '<span class="ai-quiz-answer-letter">' + letters[i] + '</span>' +
                    '<span>' + q.answers[i].text + '</span>' +
                '</button>';
        }

        render(
            '<div class="ai-quiz-screen ai-quiz-question">' +
                '<div class="ai-quiz-progress">' +
                    '<div class="ai-quiz-progress-meta">' +
                        '<span class="ai-quiz-progress-label">Question ' + (currentQ + 1) + ' of ' + CFG.QUESTIONS.length + '</span>' +
                        '<span class="ai-quiz-progress-label">' + pct + '%</span>' +
                    '</div>' +
                    '<div class="ai-quiz-progress-track"><div class="ai-quiz-progress-fill" style="width:' + pct + '%"></div></div>' +
                '</div>' +
                '<h3>' + q.question + '</h3>' +
                '<div class="ai-quiz-answers">' + answersHTML + '</div>' +
                '<button class="ai-quiz-back">' + ICONS.back + ' Back</button>' +
            '</div>'
        );
    }

    /* ---- EMAIL GATE ---- */
    function renderGate() {
        state = STATES.GATE;
        render(
            '<div class="ai-quiz-screen ai-quiz-gate">' +
                '<div class="ai-quiz-progress">' +
                    '<div class="ai-quiz-progress-meta">' +
                        '<span class="ai-quiz-progress-label">Almost there</span>' +
                        '<span class="ai-quiz-progress-label">100%</span>' +
                    '</div>' +
                    '<div class="ai-quiz-progress-track"><div class="ai-quiz-progress-fill" style="width:100%"></div></div>' +
                '</div>' +
                '<h3>Your results are ready</h3>' +
                '<p>Enter your details to see your AI maturity level and personalised recommendations.</p>' +
                '<form class="ai-quiz-gate-form" novalidate>' +
                    '<div>' +
                        '<label>Full Name <span class="required">*</span></label>' +
                        '<input type="text" name="fullName" placeholder="Jane Smith" required autocomplete="name">' +
                        '<div class="ai-quiz-gate-error" data-field="fullName">Name is required</div>' +
                    '</div>' +
                    '<div>' +
                        '<label>Email <span class="required">*</span></label>' +
                        '<input type="email" name="email" placeholder="jane@company.com" required autocomplete="email">' +
                        '<div class="ai-quiz-gate-error" data-field="email">Please enter a valid email</div>' +
                    '</div>' +
                    '<div>' +
                        '<label>Company</label>' +
                        '<input type="text" name="company" placeholder="Optional" autocomplete="organization">' +
                    '</div>' +
                    '<button type="submit" class="ai-quiz-btn">See My Results</button>' +
                '</form>' +
            '</div>'
        );
    }

    /* ---- Gate submit handler ---- */
    function handleGateSubmit(e) {
        e.preventDefault();
        var form = e.target;
        var fullName = form.fullName.value.trim();
        var email = form.email.value.trim();
        var company = form.company.value.trim();
        var valid = true;

        clearGateErrors(form);

        if (!fullName) {
            showGateError(form, 'fullName');
            valid = false;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showGateError(form, 'email');
            valid = false;
        }
        if (!valid) return;

        var nameParts = fullName.split(/\s+/);
        var firstName = nameParts[0] || '';
        var lastName = nameParts.slice(1).join(' ') || '';

        gateData = { firstName: firstName, lastName: lastName, fullName: fullName, email: email, company: company, scoreString: '' };
        quizScore = computeScore();
        quizLevel = getLevel(quizScore);

        fireEvent('ai_quiz_lead_captured', { email: email, score: quizScore });

        /* Submit GATE data to GHL */
        var scoreString = 'Level ' + quizLevel.level + ': ' + quizLevel.label + ' — ' + quizScore + '/40';
        gateData.scoreString = scoreString;
        var gateFormData = {
            formId: 'VKibV9jaWzU6MWDosbXX',
            location_id: '1CRkPO5O8TwTWL8msQNK',
            full_name: fullName,
            email: email,
            organization: company,
            jzxV1vhcWvComXIXHTER: scoreString
        };

        var gatePayload = new FormData();
        gatePayload.set('formData', JSON.stringify(gateFormData));

        if (window.grecaptcha) {
            window.grecaptcha.execute('6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX', { action: 'submit' })
                .then(function (token) {
                    gatePayload.set('captchaV3', token);
                    return fetch('https://backend.leadconnectorhq.com/forms/submit', { method: 'POST', body: gatePayload });
                })
                .catch(function () {});
        } else {
            fetch('https://backend.leadconnectorhq.com/forms/submit', { method: 'POST', body: gatePayload })
                .catch(function () {});
        }

        setSuppression('ai_quiz_submitted');
        hideBubble();
        renderResults(quizScore, quizLevel);
        fireEvent('ai_quiz_level_assigned', { level: quizLevel.label });
    }

    function showGateError(form, fieldName) {
        var input = form.querySelector('[name="' + fieldName + '"]');
        var err = form.querySelector('[data-field="' + fieldName + '"]');
        if (input) input.classList.add('error');
        if (err) err.classList.add('visible');
    }

    function clearGateErrors(form) {
        var inputs = form.querySelectorAll('input');
        var errors = form.querySelectorAll('.ai-quiz-gate-error');
        for (var i = 0; i < inputs.length; i++) inputs[i].classList.remove('error');
        for (var j = 0; j < errors.length; j++) errors[j].classList.remove('visible');
    }

    /* ---- RESULTS ---- */
    function renderResults(score, level) {
        state = STATES.RESULTS;

        render(
            '<div class="ai-quiz-screen ai-quiz-results">' +
                '<div class="ai-quiz-results-badge">' + ICONS.check + '</div>' +
                '<div class="ai-quiz-results-eyebrow">Your AI Maturity Level</div>' +
                '<h3>Level ' + level.level + ': ' + level.label + '</h3>' +
                '<div class="ai-quiz-results-score">Score: ' + score + ' / 40</div>' +
                '<p class="ai-quiz-results-desc">' + level.description + '</p>' +
                '<div class="ai-quiz-results-ctas">' +
                    '<button class="ai-quiz-btn ai-quiz-eval-btn">Request an Evaluation</button>' +
                '</div>' +
            '</div>'
        );
    }

    /* ---- EVALUATION FORM (remaining GHL fields) ---- */
    function renderEvalForm() {
        state = STATES.EVAL;

        render(
            '<div class="ai-quiz-screen ai-quiz-gate">' +
                '<h3>Complete Your Evaluation Request</h3>' +
                '<p>We already have your name and email — just a couple more details so we can prepare a meaningful evaluation.</p>' +
                '<form class="ai-quiz-gate-form ai-quiz-eval-form" novalidate>' +
                    '<div>' +
                        '<label>Phone Number</label>' +
                        '<input type="tel" name="phone" placeholder="(555) 555-5555" autocomplete="tel">' +
                    '</div>' +
                    '<div>' +
                        '<label>How Can We Help You?</label>' +
                        '<textarea name="message" rows="3" placeholder="Tell us about your business and what you\'re looking for..."></textarea>' +
                    '</div>' +
                    '<div class="ai-quiz-consent">' +
                        '<label class="ai-quiz-checkbox">' +
                            '<input type="checkbox" name="consent">' +
                            '<span>I consent to receive text messages from Vantage Method, including updates and promotional offers. Message frequency varies, message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.</span>' +
                        '</label>' +
                    '</div>' +
                    '<button type="submit" class="ai-quiz-btn">Submit Evaluation Request</button>' +
                '</form>' +
            '</div>'
        );
    }

    /* ---- Eval form submit → GHL endpoint ---- */
    function handleEvalSubmit(e) {
        e.preventDefault();
        var form = e.target;
        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="ai-quiz-spinner"></span> Submitting…';

        var consent = form.consent && form.consent.checked;

        var formDataObj = {
            formId: 'WaxOXqW9pgOw73tPypGH',
            location_id: '1CRkPO5O8TwTWL8msQNK',
            full_name: gateData.fullName || '',
            phone: form.phone.value.trim(),
            email: gateData.email || '',
            O1ZK1afg16NtCpzq4qcr: form.message.value.trim(),
            jzxV1vhcWvComXIXHTER: gateData.scoreString || ''
        };

        if (consent) {
            formDataObj.terms_and_conditions_1_g88vo6h46rs = 'terms_and_conditions';
            formDataObj.terms_and_conditions_2_g88vo6h46rs = 'terms_and_conditions';
        }

        var payload = new FormData();
        payload.set('formData', JSON.stringify(formDataObj));

        if (window.grecaptcha) {
            window.grecaptcha.execute('6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX', { action: 'submit' })
                .then(function (token) {
                    payload.set('captchaV3', token);
                    return fetch('https://backend.leadconnectorhq.com/forms/submit', { method: 'POST', body: payload });
                })
                .then(function () { renderEvalSuccess(); })
                .catch(function () { renderEvalSuccess(); });
        } else {
            fetch('https://backend.leadconnectorhq.com/forms/submit', { method: 'POST', body: payload })
                .then(function () { renderEvalSuccess(); })
                .catch(function () { renderEvalSuccess(); });
        }
    }

    /* ---- Eval success confirmation ---- */
    function renderEvalSuccess() {
        state = STATES.EVAL_SUCCESS;

        render(
            '<div class="ai-quiz-screen ai-quiz-results">' +
                '<div class="ai-quiz-results-badge">' + ICONS.check + '</div>' +
                '<div class="ai-quiz-results-eyebrow">Evaluation Requested</div>' +
                '<h3>We\u2019ll be in touch</h3>' +
                '<p class="ai-quiz-results-desc">Thanks, ' + (gateData.firstName || '') + '. We\u2019ve received your evaluation request and will reach out within one business day.</p>' +
                '<button class="ai-quiz-btn" onclick="this.closest(\'.ai-quiz-overlay\').querySelector(\'.ai-quiz-close\').click()">Close</button>' +
            '</div>'
        );
    }

    /* ---- Open / close modal ---- */
    function openModal() {
        if (!overlay) buildShell();
        renderIntro();
        overlay.classList.add('active');
        document.body.classList.add('ai-quiz-open');
        modal.focus();
    }

    function closeModal() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.classList.remove('ai-quiz-open');

        if (state !== STATES.RESULTS && state !== STATES.EVAL && state !== STATES.EVAL_SUCCESS) {
            setSuppression('ai_quiz_closed');
        }

        state = STATES.INTRO;
        currentQ = 0;
    }

    /* ---- Focus trap ---- */
    function setupFocusTrap() {
        var focusable = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (focusTrap) modal.removeEventListener('keydown', focusTrap);

        focusTrap = function (e) {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        modal.addEventListener('keydown', focusTrap);
    }

    /* ---- ESC to close ---- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            closeModal();
        }
    });

    /* ---- Floating bubble ---- */
    function buildBubble() {
        bubbleEl = document.createElement('button');
        bubbleEl.className = 'ai-quiz-bubble';
        bubbleEl.setAttribute('aria-label', 'Take the AI Diagnostic');
        bubbleEl.innerHTML =
            ICONS.zap +
            '<span>AI Diagnostic</span>' +
            '<span class="ai-quiz-bubble-dot"></span>';
        document.body.appendChild(bubbleEl);

        bubbleEl.addEventListener('click', function () {
            openModal();
        });
    }

    function showBubble() {
        if (!bubbleEl) buildBubble();
        bubbleEl.classList.add('visible');
    }

    function hideBubble() {
        if (bubbleEl) bubbleEl.classList.remove('visible');
    }

    function initBubble() {
        if (!CFG.BUBBLE_ENABLED) return;

        var anchor = document.querySelector(CFG.BUBBLE_ANCHOR_SELECTOR);
        if (!anchor) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                    showBubble();
                } else if (entry.isIntersecting) {
                    hideBubble();
                }
            });
        }, { threshold: 0 });

        observer.observe(anchor);
    }

    /* ---- Trigger system ---- */
    function initTriggers() {
        var mode = CFG.TRIGGER_MODE;
        var suppressed = isSuppressed();

        document.addEventListener('click', function (e) {
            var trigger = e.target.closest('[data-ai-quiz-trigger]');
            if (trigger) {
                e.preventDefault();
                openModal();
            }
        });

        initBubble();

        if (suppressed) return;

        if (mode === 'time' || mode === 'multi') {
            setTimeout(function () {
                if (!overlay || !overlay.classList.contains('active')) {
                    openModal();
                }
            }, (CFG.DELAY_SECONDS || 30) * 1000);
        }

        if (mode === 'exit' || mode === 'multi') {
            var exitFired = false;
            document.documentElement.addEventListener('mouseleave', function (e) {
                if (exitFired) return;
                if (e.clientY > 0) return;
                exitFired = true;
                if (!overlay || !overlay.classList.contains('active')) {
                    openModal();
                }
            });
        }
    }

    /* ---- Init on DOM ready ---- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTriggers);
    } else {
        initTriggers();
    }

})();
