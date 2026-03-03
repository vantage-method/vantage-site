(function () {
  'use strict';

  // Tooltip text for each rating
  var tips = {
    A: 'Completed',
    P: 'In Progress',
    N: 'Needs Development',
    X: 'Not Needed'
  };

  // Section data
  var sections = [
    {
      num: 'I', title: 'BRAND STRATEGY & IDENTITY',
      items: [
        'Defined mission & vision', 'Clear value proposition', 'Market positioning strategy',
        'Customer personas defined', 'Competitive analysis completed', 'Messaging framework',
        'Brand voice & tone guide', 'Brand story / narrative', 'Logo finalized',
        'Brand color palette', 'Typography system', 'Brand style guide',
        'Social templates', 'Trademark protection'
      ]
    },
    {
      num: 'II', title: 'WEBSITE & DIGITAL INFRASTRUCTURE',
      items: [
        'Defined site architecture', 'Conversion-optimized layout', 'Mobile optimized',
        'Hosting configured', 'Domain properly configured', 'Technical SEO setup',
        'Products structured online', 'Payment gateway integrated', 'Checkout optimized',
        'Cart abandonment system', 'Subscription logic (if applicable)', 'Google Analytics installed',
        'Conversion tracking set up', 'Meta Pixel installed', 'Heatmaps installed', 'Dashboard reporting'
      ]
    },
    {
      num: 'III', title: 'APP (IF APPLICABLE)',
      items: [
        'App concept defined', 'UX/UI architecture', 'Role-based access',
        'Push notifications', 'Payment integration', 'CRM integration'
      ]
    },
    {
      num: 'IV', title: 'CONTENT STRATEGY & PRODUCTION',
      items: [
        'Content pillars defined', 'Editorial calendar', 'Funnel-based content map',
        'Repurposing system', 'Blog content', 'Video production',
        'Micro content', 'Lead magnets', 'Sales pages', 'Case studies'
      ]
    },
    {
      num: 'V', title: 'EMAIL MARKETING',
      items: [
        'Email platform configured', 'Welcome sequence', 'Nurture sequence',
        'Sales sequence', 'Abandoned cart sequence', 'List segmentation'
      ]
    },
    {
      num: 'VI', title: 'PAID ADVERTISING',
      items: [
        'Meta pixel installed', 'Meta campaign structure', 'Meta creative developed',
        'Meta retargeting campaigns', 'Google keyword research', 'Google search campaigns',
        'Google display campaigns', 'Google conversion tracking'
      ]
    },
    {
      num: 'VII', title: 'SEO',
      items: [
        'Technical SEO audit', 'On-page SEO optimization',
        'Content SEO strategy', 'Backlink strategy'
      ]
    },
    {
      num: 'VIII', title: 'AUTOMATION & CRM',
      items: [
        'CRM system selected', 'Lead routing logic', 'Sales pipeline setup',
        'SMS automation', 'Internal workflow automation'
      ]
    },
    {
      num: 'IX', title: 'CONVERSION OPTIMIZATION',
      items: [
        'Landing page A/B testing', 'CTA optimization',
        'Pricing strategy refinement', 'Offer testing'
      ]
    },
    {
      num: 'X', title: 'SALES ENABLEMENT',
      items: [
        'Sales scripts', 'Proposal templates',
        'Objection handling framework', 'Deal tracking dashboards'
      ]
    },
    {
      num: 'XI', title: 'REPUTATION & PR',
      items: [
        'Review acquisition system', 'Testimonial capture',
        'Press outreach', 'Influencer strategy'
      ]
    },
    {
      num: 'XII', title: 'STRATEGIC OVERSIGHT',
      items: [
        'Go-to-market roadmap', 'Pricing model strategy',
        'Revenue modeling', 'Exit positioning strategy'
      ]
    }
  ];

  var main = document.getElementById('main-content');

  // Build section tables
  sections.forEach(function (sec, si) {
    var sectionEl = document.createElement('div');
    sectionEl.className = 'section';
    sectionEl.id = 'section-' + si;

    var header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML =
      '<span class="section-num">' + sec.num + '</span>' +
      '<span class="section-title">' + sec.title + '</span>' +
      '<div class="section-progress">' +
        '<div class="progress-bar-wrap"><div class="progress-bar-fill" id="pb-' + si + '" style="width:0%"></div></div>' +
        '<span class="progress-pct" id="pp-' + si + '">0%</span>' +
      '</div>';

    var table = document.createElement('table');
    table.innerHTML =
      '<thead><tr>' +
        '<th>Item</th>' +
        '<th data-tip="Completed">A</th>' +
        '<th data-tip="In Progress">P</th>' +
        '<th data-tip="Needs Development">N</th>' +
        '<th data-tip="Not Needed">X</th>' +
      '</tr></thead>' +
      '<tbody></tbody>';
    var tbody = table.querySelector('tbody');

    sec.items.forEach(function (item, ii) {
      var row = document.createElement('tr');
      var name = 'r-' + si + '-' + ii;
      row.innerHTML =
        '<td>' + item + '</td>' +
        ['A', 'P', 'N', 'X'].map(function (v) {
          return '<td><div class="radio-group">' +
            '<input class="radio-btn" type="radio" name="' + name + '" id="' + name + '-' + v + '" value="' + v + '">' +
            '<label class="radio-label" for="' + name + '-' + v + '" data-tip="' + tips[v] + '">' + v + '</label>' +
          '</div></td>';
        }).join('');
      tbody.appendChild(row);
    });

    sectionEl.appendChild(header);
    sectionEl.appendChild(table);
    main.appendChild(sectionEl);
  });

  // Scores summary section
  var scoresSection = document.createElement('div');
  scoresSection.id = 'scores-section';
  scoresSection.innerHTML =
    '<div class="scores-header">' +
      '<div>' +
        '<div class="label">XIII</div>' +
        '<h2>WORKLOAD SUMMARY</h2>' +
      '</div>' +
    '</div>' +
    '<div class="scores-grid">' +
      '<div class="score-card card-N">' +
        '<span class="score-badge" id="score-N">0</span>' +
        '<span class="score-label-letter">N</span>' +
        '<span class="score-desc">Needs Development</span>' +
      '</div>' +
      '<div class="score-card card-P">' +
        '<span class="score-badge" id="score-P">0</span>' +
        '<span class="score-label-letter">P</span>' +
        '<span class="score-desc">In Progress</span>' +
      '</div>' +
      '<div class="score-card card-A">' +
        '<span class="score-badge" id="score-A">0</span>' +
        '<span class="score-label-letter">A</span>' +
        '<span class="score-desc">Completed</span>' +
      '</div>' +
      '<div class="score-card card-X">' +
        '<span class="score-badge" id="score-X">0</span>' +
        '<span class="score-label-letter">X</span>' +
        '<span class="score-desc">Not Needed</span>' +
      '</div>' +
    '</div>' +
    '<div class="overall-bar">' +
      '<span class="overall-label">Completion Rate</span>' +
      '<div class="overall-track"><div class="overall-fill" id="overall-fill" style="width:0%"></div></div>' +
      '<span class="overall-pct" id="overall-pct">0%</span>' +
    '</div>' +
    '<div class="complexity-row">' +
      '<span class="complexity-label">Estimated Complexity</span>' +
      '<div class="complexity-options">' +
        '<div class="complexity-chip" id="chip-Low">Low</div>' +
        '<div class="complexity-chip" id="chip-Moderate">Moderate</div>' +
        '<div class="complexity-chip" id="chip-High">High</div>' +
        '<div class="complexity-chip" id="chip-Enterprise">Enterprise</div>' +
      '</div>' +
    '</div>';
  main.appendChild(scoresSection);

  // Submit button
  // TODO: Wire up submission to GoHighLevel (GHL) — collect all ratings,
  //       meta fields (company, date, contact), scores, and POST to GHL webhook.
  var submitWrap = document.createElement('div');
  submitWrap.className = 'submit-wrap';
  submitWrap.innerHTML =
    '<button type="button" class="submit-btn" id="submit-assessment">' +
      '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>' +
      'Submit Assessment' +
    '</button>';
  main.appendChild(submitWrap);

  document.getElementById('submit-assessment').addEventListener('click', function () {
    // TODO: Replace with GHL webhook submission
    alert('Submission is not yet connected. This will send the assessment to GoHighLevel in a future update.');
  });

  // ===== Score calculation =====
  function updateScores() {
    var counts = { A: 0, P: 0, N: 0, X: 0 };

    // Per-section: track A count and X count against total items
    var sectionStats = sections.map(function () {
      return { aCount: 0, xCount: 0, totalItems: 0 };
    });

    sections.forEach(function (sec, si) {
      sectionStats[si].totalItems = sec.items.length;

      sec.items.forEach(function (_, ii) {
        var name = 'r-' + si + '-' + ii;
        var checked = document.querySelector('input[name="' + name + '"]:checked');
        if (checked) {
          counts[checked.value]++;
          if (checked.value === 'A') sectionStats[si].aCount++;
          if (checked.value === 'X') sectionStats[si].xCount++;
        }
      });
    });

    // Update section progress bars
    // Progress = A / (totalItems - X), i.e. completed out of applicable items
    sectionStats.forEach(function (ss, si) {
      var applicable = ss.totalItems - ss.xCount;
      var pct = applicable > 0 ? Math.round((ss.aCount / applicable) * 100) : 0;
      document.getElementById('pb-' + si).style.width = pct + '%';
      document.getElementById('pp-' + si).textContent = pct + '%';
    });

    // Update score cards
    ['A', 'P', 'N', 'X'].forEach(function (k) {
      document.getElementById('score-' + k).textContent = counts[k];
    });

    // Overall completion rate: A / (A + P + N) excluding X
    var active = counts.A + counts.P + counts.N;
    var completionPct = active > 0 ? Math.round((counts.A / active) * 100) : 0;
    document.getElementById('overall-fill').style.width = completionPct + '%';
    document.getElementById('overall-pct').textContent = completionPct + '%';

    // Auto complexity based on N / (A + P + N)
    var totalMarked = counts.A + counts.P + counts.N + counts.X;
    ['Low', 'Moderate', 'High', 'Enterprise'].forEach(function (c) {
      document.getElementById('chip-' + c).className = 'complexity-chip';
    });
    if (totalMarked === 0) return;
    var needsPct = active > 0 ? counts.N / active : 0;
    var level;
    if (needsPct >= 0.6) level = 'Enterprise';
    else if (needsPct >= 0.4) level = 'High';
    else if (needsPct >= 0.2) level = 'Moderate';
    else level = 'Low';
    document.getElementById('chip-' + level).classList.add('active-' + level);
  }

  document.addEventListener('change', function (e) {
    if (e.target.type === 'radio') updateScores();
  });

  // ===== Sticky legend =====
  var legend = document.getElementById('legend');

  if (legend && window.IntersectionObserver) {
    // Create a sentinel element right before the legend's natural position
    var sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.marginBottom = '-1px';
    legend.parentNode.insertBefore(sentinel, legend);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // When sentinel scrolls out of view, legend is stuck
        legend.classList.toggle('is-stuck', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(sentinel);
  }

  // ===== Set today's date =====
  var today = new Date();
  document.getElementById('date-field').value =
    (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
    today.getDate().toString().padStart(2, '0') + '/' +
    today.getFullYear();
})();
