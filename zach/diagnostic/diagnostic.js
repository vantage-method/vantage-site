(function () {
    'use strict';

    /* ───────────────────────────────────────────
       CONSTANTS & CONFIGURATION
    ─────────────────────────────────────────── */

    var CALENDLY_URL = 'https://calendly.com/zachgrayvantagemethod/vantagemethod-discovery-call';
    var GHL_ENDPOINT = 'https://backend.leadconnectorhq.com/forms/submit';
    var GHL_FORM_ID = '7RO95pLcQ8svRkFQJGPt';
    var GHL_LOCATION_ID = '1CRkPO5O8TwTWL8msQNK';
    var RECAPTCHA_KEY = '6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX';

    var STATES = { INTRO: 'intro', QUESTION: 'question', GATE: 'gate', RESULTS: 'results' };

    var QUESTIONS = [
        // Category 1 — Message Clarity
        {
            category: 'message',
            categoryLabel: 'Message Clarity',
            question: 'When someone lands on your website or hears your pitch, can they explain back to you — in one sentence — exactly what problem you solve and for whom?',
            lowLabel: 'Never',
            highLabel: 'Always'
        },
        {
            category: 'message',
            categoryLabel: 'Message Clarity',
            question: 'Your marketing leads with the outcome your client gets — not what you do or how you do it.',
            lowLabel: 'Not at all',
            highLabel: 'Completely'
        },
        {
            category: 'message',
            categoryLabel: 'Message Clarity',
            question: 'Your messaging makes your ideal client feel emotionally understood — like you\'ve read their journal — before you ever mention your solution.',
            lowLabel: 'Not at all',
            highLabel: 'Completely'
        },
        // Category 2 — Funnel Simplicity
        {
            category: 'funnel',
            categoryLabel: 'Funnel Simplicity',
            question: 'A stranger who finds you today knows — within 60 seconds — exactly what one action to take next.',
            lowLabel: 'Never',
            highLabel: 'Always'
        },
        {
            category: 'funnel',
            categoryLabel: 'Funnel Simplicity',
            question: 'Your sales process has three steps or fewer from first contact to closed deal.',
            lowLabel: 'Not even close',
            highLabel: 'Exactly right'
        },
        {
            category: 'funnel',
            categoryLabel: 'Funnel Simplicity',
            question: 'You can describe your entire customer journey on a single page without confusion or asterisks.',
            lowLabel: 'No way',
            highLabel: 'Easily'
        },
        // Category 3 — Client Retention Engine
        {
            category: 'retention',
            categoryLabel: 'Client Retention Engine',
            question: 'You have a deliberate system to move existing clients into your next offer — not just hope they come back.',
            lowLabel: 'No system',
            highLabel: 'Fully built'
        },
        {
            category: 'retention',
            categoryLabel: 'Client Retention Engine',
            question: 'You actively ask existing clients what else they need — and you build or bundle offers around those answers.',
            lowLabel: 'Never',
            highLabel: 'Systematically'
        },
        {
            category: 'retention',
            categoryLabel: 'Client Retention Engine',
            question: 'More than half of your revenue last year came from repeat clients or referrals — not new cold acquisition.',
            lowLabel: 'Definitely not',
            highLabel: 'Yes, easily'
        },
        // Category 4 — Lead Gen Strategy
        {
            category: 'leadgen',
            categoryLabel: 'Lead Gen Strategy',
            question: 'Before spending on paid ads or major campaigns, you validated your offer with real buyers who said yes with their wallet.',
            lowLabel: 'Never done it',
            highLabel: 'Always do it'
        },
        {
            category: 'leadgen',
            categoryLabel: 'Lead Gen Strategy',
            question: 'You know which single lead source drives your best clients — and you\'re doubling down on it, not spreading thin across five channels.',
            lowLabel: 'No idea',
            highLabel: 'Crystal clear'
        },
        {
            category: 'leadgen',
            categoryLabel: 'Lead Gen Strategy',
            question: 'Your current lead gen strategy is built to attract your ideal client — not just anyone who might buy.',
            lowLabel: 'Not really',
            highLabel: 'Precisely'
        }
    ];

    var CATEGORIES = {
        message:   { label: 'Message Clarity',        tag: 'leak-message',   questions: [0, 1, 2] },
        funnel:    { label: 'Funnel Simplicity',      tag: 'leak-funnel',    questions: [3, 4, 5] },
        retention: { label: 'Client Retention Engine', tag: 'leak-retention', questions: [6, 7, 8] },
        leadgen:   { label: 'Lead Gen Strategy',       tag: 'leak-leadgen',   questions: [9, 10, 11] }
    };

    var CAT_ORDER = ['message', 'funnel', 'retention', 'leadgen'];

    var INSIGHTS = {
        message: {
            red: 'Your message is about you — not your client. Buyers are confused before they get a chance to care. This is usually the first thing we fix.',
            amber: 'Your message is partially there but still too feature-focused. We need to make your client the hero and sharpen the emotional hook.',
            green: 'Your message is strong. The question now is whether it\'s reaching the right people at the right volume.'
        },
        funnel: {
            red: 'Your funnel has too many steps or too many options. Confused buyers don\'t buy. Simplicity is your fastest path to more revenue.',
            amber: 'Your funnel works sometimes but creates friction at key moments. One or two strategic simplifications could significantly lift conversion.',
            green: 'Your funnel is clean. Focus now shifts to optimizing conversion at each stage rather than restructuring.'
        },
        retention: {
            red: 'You\'re running a leaky bucket — pouring new clients in while existing ones quietly walk out the back door. Ten times cheaper to fix this first.',
            amber: 'You have some retention happening but it\'s not systematized. You\'re leaving repeat revenue on the table without knowing it.',
            green: 'Your retention is solid. The opportunity here is to formalize it so it runs without you in the room.'
        },
        leadgen: {
            red: 'You\'re scaling noise. Ads before validation is one of the most expensive mistakes in growth. We need to validate before we amplify.',
            amber: 'Your lead gen has some signal but you haven\'t fully committed to what\'s working. Time to double down and cut the rest.',
            green: 'Your lead gen is validated and focused. Now it\'s about scaling what\'s already working — systematically.'
        }
    };

    var HEADLINES = {
        green: "You're close. A few targeted fixes could unlock significant growth.",
        amber: "You've got real leaks. The good news: they're diagnosable and fixable.",
        red: "The ceiling makes sense now. There are several gaps that need to close before you can scale."
    };

    var TIER_LABELS = { green: 'Solid', amber: 'Leaking', red: 'Critical Leak' };

    var SYMPTOMS = {
        message: 'low website conversion or confused prospects',
        funnel: 'leads who don\'t move forward',
        retention: 'constantly needing new clients',
        leadgen: 'ads or campaigns that don\'t perform'
    };

    var ROOT_CAUSES = {
        message: 'the message describes what you do instead of what they get',
        funnel: 'too many options or too many steps between interest and yes',
        retention: 'no deliberate system to serve existing clients at the next level',
        leadgen: 'scaling spend before validating the offer'
    };

    /* ───────────────────────────────────────────
       STATE
    ─────────────────────────────────────────── */

    var state = STATES.INTRO;
    var currentQ = 0;
    var answers = [];
    var container;
    var scores = null;

    /* ───────────────────────────────────────────
       UTILITIES
    ─────────────────────────────────────────── */

    function fireEvent(name, params) {
        params = params || {};
        if (window.dataLayer) {
            window.dataLayer.push(Object.assign({ event: name }, params));
        } else if (window.gtag) {
            window.gtag('event', name, params);
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /* ───────────────────────────────────────────
       SCORING
    ─────────────────────────────────────────── */

    function computeScores() {
        var results = {};
        var i, j, key, indices, sum, pct, tier;

        for (i = 0; i < CAT_ORDER.length; i++) {
            key = CAT_ORDER[i];
            indices = CATEGORIES[key].questions;
            sum = 0;
            for (j = 0; j < indices.length; j++) {
                sum += (answers[indices[j]] || 1);
            }
            pct = Math.round((sum / 15) * 100);
            if (pct >= 70) tier = 'green';
            else if (pct >= 45) tier = 'amber';
            else tier = 'red';

            results[key] = { sum: sum, pct: pct, tier: tier, label: CATEGORIES[key].label };
        }

        // Overall average
        var totalPct = 0;
        for (i = 0; i < CAT_ORDER.length; i++) {
            totalPct += results[CAT_ORDER[i]].pct;
        }
        var avgPct = Math.round(totalPct / 4);
        var overallTier;
        if (avgPct >= 70) overallTier = 'green';
        else if (avgPct >= 45) overallTier = 'amber';
        else overallTier = 'red';

        // Fix This First — lowest scoring category (handle ties)
        var lowestPct = 101;
        var fixFirst = [];
        for (i = 0; i < CAT_ORDER.length; i++) {
            key = CAT_ORDER[i];
            if (results[key].pct < lowestPct) {
                lowestPct = results[key].pct;
                fixFirst = [key];
            } else if (results[key].pct === lowestPct) {
                fixFirst.push(key);
            }
        }

        return {
            categories: results,
            avgPct: avgPct,
            overallTier: overallTier,
            fixFirst: fixFirst
        };
    }

    /* ───────────────────────────────────────────
       GHL SUBMISSION
    ─────────────────────────────────────────── */

    function buildScoreString(s) {
        var parts = [];
        for (var i = 0; i < CAT_ORDER.length; i++) {
            var key = CAT_ORDER[i];
            var cat = s.categories[key];
            parts.push(cat.label + ': ' + cat.pct + '% (' + TIER_LABELS[cat.tier] + ')');
        }
        parts.push('Overall: ' + s.avgPct + '%');
        var fixLabels = [];
        for (var j = 0; j < s.fixFirst.length; j++) {
            fixLabels.push(s.categories[s.fixFirst[j]].label);
        }
        parts.push('Fix First: ' + fixLabels.join(', '));
        return parts.join(' | ');
    }

    function buildTagString(s) {
        var tags = ['diagnostic-lead'];
        // Add leak tag for worst category
        for (var i = 0; i < s.fixFirst.length; i++) {
            tags.push(CATEGORIES[s.fixFirst[i]].tag);
        }
        // High priority if 2+ reds
        var redCount = 0;
        for (var j = 0; j < CAT_ORDER.length; j++) {
            if (s.categories[CAT_ORDER[j]].tier === 'red') redCount++;
        }
        if (redCount >= 2) tags.push('high-priority-diagnostic');
        return tags.join(', ');
    }

    function submitToGHL(firstName, email, fixFirstText) {
        var scoreString = buildScoreString(scores);
        var tagString = buildTagString(scores);

        // Use first fixFirst category for email fields (if tie, pick first)
        var worstKey = scores.fixFirst[0];
        var worstCat = scores.categories[worstKey];
        var worstInsight = INSIGHTS[worstKey][worstCat.tier];

        var formDataObj = {
            formId: GHL_FORM_ID,
            location_id: GHL_LOCATION_ID,
            first_name: firstName,
            email: email,
            '9MJSN5Nzoq2LtIE8TwY2': scoreString,
            '1bqFnfXVj43dV19dujxp': tagString,
            'TxHvVyL5cRVJJB7IXYsT': worstCat.label,
            '7owKpRqVUZOVctDO3DSN': worstInsight,
            'ssQhyLqn7Cjx48ye2lFT': SYMPTOMS[worstKey],
            'yLr3gcPPwuFV87HBfzWS': ROOT_CAUSES[worstKey]
        };

        if (fixFirstText) {
            formDataObj['EUUGx28BEKXWLZfD7BYF'] = fixFirstText;
        }

        var payload = new FormData();
        payload.set('formData', JSON.stringify(formDataObj));

        if (window.grecaptcha) {
            window.grecaptcha.execute(RECAPTCHA_KEY, { action: 'submit' })
                .then(function (token) {
                    payload.set('captchaV3', token);
                    return fetch(GHL_ENDPOINT, { method: 'POST', body: payload });
                })
                .catch(function () {});
        } else {
            fetch(GHL_ENDPOINT, { method: 'POST', body: payload }).catch(function () {});
        }
    }

    /* ───────────────────────────────────────────
       RENDERING ENGINE
    ─────────────────────────────────────────── */

    function render(html) {
        container.innerHTML = html;
        container.scrollTop = 0;
        window.scrollTo(0, 0);
        bindScreen();
    }

    /* ───────────────────────────────────────────
       SCREEN: INTRO
    ─────────────────────────────────────────── */

    function renderIntro() {
        state = STATES.INTRO;
        render(
            '<div class="diag-screen diag-intro">' +
                '<div class="diag-intro-badge">' +
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' +
                    '</svg>' +
                '</div>' +
                '<h1 class="diag-intro-title">Growth Ceiling Diagnostic</h1>' +
                '<p class="diag-intro-desc">Find out exactly what\'s limiting your growth — and which problem to fix first.</p>' +
                '<div class="diag-intro-meta">' +
                    '<span class="diag-meta-tag">12 Questions</span>' +
                    '<span class="diag-meta-tag">5 Minutes</span>' +
                    '<span class="diag-meta-tag">Instant Results</span>' +
                '</div>' +
                '<button class="diag-btn diag-start-btn">Start the Diagnostic</button>' +
                '<p class="diag-intro-note">Your answers are scored across 4 categories. You\'ll see your personalized results immediately after providing your email.</p>' +
            '</div>'
        );
    }

    /* ───────────────────────────────────────────
       SCREEN: QUESTION
    ─────────────────────────────────────────── */

    function renderQuestion() {
        state = STATES.QUESTION;
        var q = QUESTIONS[currentQ];
        var pct = Math.round((currentQ / 12) * 100);
        var selected = answers[currentQ] || 0;

        var scaleHTML = '';
        for (var i = 1; i <= 5; i++) {
            var activeClass = (i === selected) ? ' active' : '';
            scaleHTML += '<button class="diag-scale-btn' + activeClass + '" data-value="' + i + '">' + i + '</button>';
        }

        render(
            '<div class="diag-screen diag-question">' +
                '<div class="diag-progress">' +
                    '<div class="diag-progress-meta">' +
                        '<span class="diag-progress-label">' + currentQ + ' of 12 answered</span>' +
                        '<span class="diag-progress-label">' + pct + '%</span>' +
                    '</div>' +
                    '<div class="diag-progress-track"><div class="diag-progress-fill" style="width:' + pct + '%"></div></div>' +
                '</div>' +
                '<p class="diag-category-eyebrow">' + q.categoryLabel + '</p>' +
                '<h2 class="diag-question-text">' + q.question + '</h2>' +
                '<div class="diag-scale-labels">' +
                    '<span>' + q.lowLabel + '</span>' +
                    '<span>' + q.highLabel + '</span>' +
                '</div>' +
                '<div class="diag-scale-buttons">' + scaleHTML + '</div>' +
                '<button class="diag-back-btn">&larr; ' + (currentQ === 0 ? 'Back to intro' : 'Previous question') + '</button>' +
            '</div>'
        );
    }

    /* ───────────────────────────────────────────
       SCREEN: EMAIL GATE
    ─────────────────────────────────────────── */

    function renderGate() {
        state = STATES.GATE;
        render(
            '<div class="diag-screen diag-gate">' +
                '<div class="diag-progress">' +
                    '<div class="diag-progress-meta">' +
                        '<span class="diag-progress-label">12 of 12 answered</span>' +
                        '<span class="diag-progress-label">100%</span>' +
                    '</div>' +
                    '<div class="diag-progress-track"><div class="diag-progress-fill" style="width:100%"></div></div>' +
                '</div>' +
                '<h2 class="diag-gate-title">Your results are ready</h2>' +
                '<p class="diag-gate-desc">Enter your details to see your Growth Ceiling score and personalized recommendations.</p>' +
                '<form class="diag-gate-form" novalidate>' +
                    '<div class="diag-form-group">' +
                        '<label for="diag-gate-name">First Name <span class="diag-required">*</span></label>' +
                        '<input type="text" id="diag-gate-name" name="firstName" placeholder="First name" required autocomplete="given-name">' +
                        '<div class="diag-gate-error" data-field="firstName">First name is required</div>' +
                    '</div>' +
                    '<div class="diag-form-group">' +
                        '<label for="diag-gate-email">Email <span class="diag-required">*</span></label>' +
                        '<input type="email" id="diag-gate-email" name="email" placeholder="you@company.com" required autocomplete="email">' +
                        '<div class="diag-gate-error" data-field="email">Please enter a valid email</div>' +
                    '</div>' +
                    '<div class="diag-form-group">' +
                        '<label for="diag-gate-fix">What\'s the one thing you most want to fix right now? <span class="diag-optional">(optional)</span></label>' +
                        '<textarea id="diag-gate-fix" name="fixFirst" rows="3" placeholder="e.g. I can\'t figure out why leads aren\'t converting..."></textarea>' +
                    '</div>' +
                    '<button type="submit" class="diag-btn">See My Results</button>' +
                    '<p class="recaptcha-notice">This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a> apply.</p>' +
                '</form>' +
                '<p class="diag-gate-skip">Prefer to just talk? <a href="' + CALENDLY_URL + '" target="_blank" rel="noopener">Skip the form and book a call directly.</a></p>' +
                '<button class="diag-back-btn">&larr; Back to questions</button>' +
            '</div>'
        );
    }

    /* ───────────────────────────────────────────
       SCREEN: RESULTS
    ─────────────────────────────────────────── */

    function renderResults() {
        state = STATES.RESULTS;
        var s = scores;
        var headline = HEADLINES[s.overallTier];
        var i, key, cat, isFixFirst, cardClass, tierClass, insight, badge;

        // Build Fix This First cards first, then the rest
        var fixFirstCards = '';
        var otherCards = '';

        for (i = 0; i < CAT_ORDER.length; i++) {
            key = CAT_ORDER[i];
            cat = s.categories[key];
            isFixFirst = s.fixFirst.indexOf(key) !== -1;
            tierClass = 'diag-tier-' + cat.tier;
            insight = INSIGHTS[key][cat.tier];
            badge = TIER_LABELS[cat.tier];
            cardClass = 'diag-result-card ' + tierClass + (isFixFirst ? ' fix-first' : '');

            var cardHTML =
                '<div class="' + cardClass + '">' +
                    (isFixFirst ? '<div class="diag-fix-first-badge">Fix This First</div>' : '') +
                    '<div class="diag-card-header">' +
                        '<h3 class="diag-card-title">' + cat.label + '</h3>' +
                        '<span class="diag-tier-badge ' + tierClass + '">' + badge + '</span>' +
                    '</div>' +
                    '<div class="diag-card-score">' + cat.pct + '%</div>' +
                    '<div class="diag-score-bar-track"><div class="diag-score-bar-fill ' + tierClass + '" data-width="' + cat.pct + '"></div></div>' +
                    '<p class="diag-card-insight">' + insight + '</p>' +
                '</div>';

            if (isFixFirst) {
                fixFirstCards += cardHTML;
            } else {
                otherCards += cardHTML;
            }
        }

        // CTA after fix-first cards
        var midCTA =
            '<div class="diag-mid-cta">' +
                '<p>Want to talk through what this means for your business?</p>' +
                '<a href="' + CALENDLY_URL + '" target="_blank" rel="noopener" class="diag-btn diag-btn-secondary">Book a Free 30-Minute Call with Zach</a>' +
            '</div>';

        render(
            '<div class="diag-screen diag-results">' +
                '<div class="diag-results-header">' +
                    '<p class="diag-results-eyebrow">Your Growth Ceiling Score</p>' +
                    '<div class="diag-results-score">' + s.avgPct + '%</div>' +
                    '<h2 class="diag-results-headline">' + headline + '</h2>' +
                '</div>' +
                '<div class="diag-results-cards">' +
                    fixFirstCards +
                    midCTA +
                    otherCards +
                '</div>' +
                '<div class="diag-bottom-cta">' +
                    '<p class="diag-bottom-cta-text">Ready to fix the leaks? Let\'s build the machine.</p>' +
                    '<a href="' + CALENDLY_URL + '" target="_blank" rel="noopener" class="diag-btn">Book a Call with Zach</a>' +
                '</div>' +
            '</div>'
        );

        // Animate score bars after render
        setTimeout(function () {
            var bars = container.querySelectorAll('.diag-score-bar-fill');
            for (var b = 0; b < bars.length; b++) {
                bars[b].style.width = bars[b].getAttribute('data-width') + '%';
            }
        }, 100);
    }

    /* ───────────────────────────────────────────
       EVENT BINDING
    ─────────────────────────────────────────── */

    function bindScreen() {
        if (state === STATES.INTRO) {
            var startBtn = container.querySelector('.diag-start-btn');
            if (startBtn) {
                startBtn.addEventListener('click', function () {
                    currentQ = 0;
                    fireEvent('diagnostic_started');
                    renderQuestion();
                });
            }
        }

        if (state === STATES.QUESTION) {
            // Scale buttons
            var scaleBtns = container.querySelectorAll('.diag-scale-btn');
            for (var i = 0; i < scaleBtns.length; i++) {
                scaleBtns[i].addEventListener('click', function () {
                    var val = parseInt(this.getAttribute('data-value'), 10);
                    answers[currentQ] = val;

                    if (currentQ < QUESTIONS.length - 1) {
                        currentQ++;
                        renderQuestion();
                    } else {
                        fireEvent('diagnostic_completed');
                        renderGate();
                    }
                });
            }

            // Back button
            var backBtn = container.querySelector('.diag-back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', function () {
                    if (currentQ > 0) {
                        currentQ--;
                        renderQuestion();
                    } else {
                        renderIntro();
                    }
                });
            }
        }

        if (state === STATES.GATE) {
            var form = container.querySelector('.diag-gate-form');
            if (form) {
                form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    handleGateSubmit(form);
                });
            }

            var backBtn2 = container.querySelector('.diag-back-btn');
            if (backBtn2) {
                backBtn2.addEventListener('click', function () {
                    currentQ = QUESTIONS.length - 1;
                    renderQuestion();
                });
            }
        }
    }

    /* ───────────────────────────────────────────
       GATE SUBMIT HANDLER
    ─────────────────────────────────────────── */

    function handleGateSubmit(form) {
        var V = window.VantageValidation || {};
        var firstName = form.firstName.value.trim();
        var email = form.email.value.trim();
        var fixFirst = form.fixFirst.value.trim();
        var valid = true;

        clearGateErrors(form);

        if (!firstName || (V.isValidName && !V.isValidName(firstName))) {
            showGateError(form, 'firstName');
            valid = false;
        }
        if (!email || (V.isValidEmail && !V.isValidEmail(email))) {
            showGateError(form, 'email');
            valid = false;
        }

        if (!valid) return;

        // Compute scores
        scores = computeScores();

        // Fire-and-forget GHL submission
        submitToGHL(firstName, email, fixFirst);

        // Analytics
        fireEvent('diagnostic_lead_captured', { email: email, score: scores.avgPct });
        fireEvent('diagnostic_results_viewed', { overallTier: scores.overallTier });

        // Show results immediately
        renderResults();
    }

    function showGateError(form, fieldName) {
        var input = form.querySelector('[name="' + fieldName + '"]');
        var err = form.querySelector('[data-field="' + fieldName + '"]');
        if (input) input.classList.add('error');
        if (err) err.classList.add('visible');
    }

    function clearGateErrors(form) {
        var inputs = form.querySelectorAll('input, textarea');
        var errors = form.querySelectorAll('.diag-gate-error');
        for (var i = 0; i < inputs.length; i++) inputs[i].classList.remove('error');
        for (var j = 0; j < errors.length; j++) errors[j].classList.remove('visible');
    }

    /* ───────────────────────────────────────────
       INIT
    ─────────────────────────────────────────── */

    function init() {
        container = document.getElementById('diagnostic-app');
        if (!container) return;
        renderIntro();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
