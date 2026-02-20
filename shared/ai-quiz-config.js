/* ============================================
   AI QUIZ — CONFIGURATION
   All constants, questions, scoring, URLs
   ============================================ */

window.AI_QUIZ_CONFIG = {

    QUIZ_ENABLED: true,

    /* Trigger mode: 'button' | 'time' | 'scroll' | 'exit' | 'multi' */
    TRIGGER_MODE: 'multi',

    DELAY_SECONDS: 10,
    SCROLL_PERCENT: 60,

    /* Floating bubble in bottom-left corner */
    BUBBLE_ENABLED: true,
    BUBBLE_ANCHOR_SELECTOR: '.mountain-sections-wrapper',

    SUPPRESS_DAYS_AFTER_CLOSE: 3,
    SUPPRESS_DAYS_AFTER_SUBMIT: 30,

    /* Webhook endpoint for lead capture (Zapier / Make / custom backend) */
    LEAD_WEBHOOK_URL: '',

    PRIMARY_CTA_URL_BLUEPRINT: '/booking',
    PRIMARY_CTA_URL_STRATEGY_CALL: '/booking',

    /* Scoring: A=1, B=2, C=3, D=4 — total range 10–40 */
    LEVEL_RANGES: [
        { min: 10, max: 18, level: 1, label: 'Curious Dabbler',  description: 'You\'ve heard the buzz and maybe tried a tool or two, but AI isn\'t part of how you operate yet. That\'s okay — clarity on where to start is the highest-leverage move right now.' },
        { min: 19, max: 26, level: 2, label: 'Content User',     description: 'You\'re using AI for content, research, or one-off tasks. But it\'s not connected to your systems or revenue. The next step is moving from "helpful tool" to "operational layer."' },
        { min: 27, max: 33, level: 3, label: 'Optimizer',        description: 'AI is embedded in parts of your workflow — you\'re saving real time and making better decisions. Now the opportunity is connecting those pieces into a system that compounds.' },
        { min: 34, max: 40, level: 4, label: 'System Builder',   description: 'You\'re running AI-powered systems across marketing, ops, or delivery. You think in workflows, not tools. The next conversation is about scale, measurement, and partnership.' }
    ],

    QUESTIONS: [
        {
            question: 'How often does your team use AI tools in day-to-day work?',
            answers: [
                { text: 'Rarely or never',                        value: 1 },
                { text: 'Occasionally, for one-off tasks',        value: 2 },
                { text: 'Regularly, across several workflows',    value: 3 },
                { text: 'Daily — it\'s embedded in our operations', value: 4 }
            ]
        },
        {
            question: 'What best describes how you use AI for content?',
            answers: [
                { text: 'We don\'t use AI for content',                        value: 1 },
                { text: 'We use it for first drafts or brainstorming',         value: 2 },
                { text: 'We have prompts and templates for repeatable output',  value: 3 },
                { text: 'AI generates content inside a system with review loops', value: 4 }
            ]
        },
        {
            question: 'How do you handle lead follow-up today?',
            answers: [
                { text: 'Manually — someone checks and responds',               value: 1 },
                { text: 'We have some email templates but it\'s inconsistent',  value: 2 },
                { text: 'Automated sequences triggered by actions',              value: 3 },
                { text: 'AI-driven workflows that qualify, route, and respond', value: 4 }
            ]
        },
        {
            question: 'How well do you understand which marketing channels drive revenue?',
            answers: [
                { text: 'We don\'t really track that',                          value: 1 },
                { text: 'We see clicks and traffic but not revenue impact',     value: 2 },
                { text: 'We can attribute leads to channels with some effort',  value: 3 },
                { text: 'We have clear attribution from click to close',        value: 4 }
            ]
        },
        {
            question: 'What role does AI play in your customer research?',
            answers: [
                { text: 'None — we rely on intuition or manual research',       value: 1 },
                { text: 'We use ChatGPT or similar for ad-hoc questions',       value: 2 },
                { text: 'We use AI to analyze reviews, competitors, or trends', value: 3 },
                { text: 'AI processes customer data to surface insights automatically', value: 4 }
            ]
        },
        {
            question: 'How automated is your reporting?',
            answers: [
                { text: 'We pull numbers manually when someone asks',           value: 1 },
                { text: 'We have dashboards but update them by hand',           value: 2 },
                { text: 'Dashboards are connected and mostly real-time',        value: 3 },
                { text: 'AI flags anomalies and summarizes performance for us', value: 4 }
            ]
        },
        {
            question: 'How do you approach repetitive operational tasks?',
            answers: [
                { text: 'People handle them — that\'s just how it works',       value: 1 },
                { text: 'We\'ve automated a few things with Zapier or similar', value: 2 },
                { text: 'Most repetitive tasks are automated or templated',     value: 3 },
                { text: 'We design workflows to eliminate repetition by default', value: 4 }
            ]
        },
        {
            question: 'How would you describe your team\'s AI literacy?',
            answers: [
                { text: 'Most people haven\'t used AI tools',                   value: 1 },
                { text: 'A few people experiment on their own',                 value: 2 },
                { text: 'Most team members use AI regularly',                   value: 3 },
                { text: 'The team builds and improves AI workflows together',   value: 4 }
            ]
        },
        {
            question: 'Do you have documented processes or SOPs for AI use?',
            answers: [
                { text: 'No documentation around AI',                           value: 1 },
                { text: 'A few people have personal prompts or notes',          value: 2 },
                { text: 'We have shared prompt libraries or guidelines',        value: 3 },
                { text: 'AI workflows are documented, versioned, and improved', value: 4 }
            ]
        },
        {
            question: 'If you could snap your fingers, what would AI do for you tomorrow?',
            answers: [
                { text: 'I honestly don\'t know where it fits',                 value: 1 },
                { text: 'Save time on content and communication',               value: 2 },
                { text: 'Automate lead gen, follow-up, or reporting',           value: 3 },
                { text: 'Run entire marketing or ops functions autonomously',   value: 4 }
            ]
        }
    ]
};
