/* ============================================
   LEAD SCORING — Service Landing Forms
   Computes qualification score from form responses,
   redirects qualified leads to /booking/
   ============================================ */
(function () {
    'use strict';

    var SCORE_THRESHOLD = 60;

    /* ---------- Score Maps ---------- */
    /* Keys use en-dash (\u2013) to match radio values exactly */

    var REVENUE_SCORES = {
        'Under $25k': 5,
        '$25k\u2013$50k': 10,
        '$50k\u2013$100k': 15,
        '$100k\u2013$250k': 20,
        '$250k+': 25
    };

    var BUDGET_SCORES = {
        'Under $1,000/month': 5,
        '$1,000\u2013$2,500/month': 10,
        '$2,500\u2013$5,000/month': 15,
        '$5,000\u2013$10,000/month': 20,
        '$10,000+/month': 25
    };

    var DECISION_SCORES = {
        'Yes': 15,
        'No': 5
    };

    var TIMELINE_SCORES = {
        'Immediately (within 30 days)': 20,
        '1\u20133 months': 15,
        '3\u20136 months': 8,
        'Just exploring': 3
    };

    /* ---------- Score Computation ---------- */

    function computeLeadScore(formDataObj) {
        var score = 0;

        var revenue = formDataObj['x0ral5kLmpepltjO1iTa'] || '';
        score += REVENUE_SCORES[revenue] || 0;

        var budget = formDataObj['vrtD7eLGrYUDZA1ZEU1F'] || '';
        score += BUDGET_SCORES[budget] || 0;

        var dm = formDataObj['66z3ZDyii7XjkddqNebS'] || '';
        score += DECISION_SCORES[dm] || 0;

        var timeline = formDataObj['X40ySEBjVQUwwQ5eAFOE'] || '';
        score += TIMELINE_SCORES[timeline] || 0;

        var serious = parseInt(formDataObj['5l7VfphF94FakdkCkRB5'], 10);
        if (!isNaN(serious) && serious >= 1 && serious <= 10) {
            score += Math.round((serious - 1) * 15 / 9);
        }

        return score;
    }

    function isQualified(score) {
        return score >= SCORE_THRESHOLD;
    }

    window.VantageLeadScoring = {
        computeLeadScore: computeLeadScore,
        isQualified: isQualified,
        THRESHOLD: SCORE_THRESHOLD
    };
})();
