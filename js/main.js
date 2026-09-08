/* ==========================================================================
   HYGIA COMMERCIAL FACILITY SERVICES - INTERACTIVE ENGINE
   ========================================================================== */

// ponytail: guarded so the pricing model can be required in node for tools/calc-check.js
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initCalculator();
    initServiceTabs();
    initChecklistTabs();
    initCitySearch();
    initFaqAccordion();
    initModals();
    initDeviceAdvisory();
  });
}

/* --------------------------------------------------------------------------
   1. Sticky Header & Mobile Nav
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = '#000000';
        navMenu.style.padding = '2rem';
        navMenu.style.borderBottom = '1px solid #0784b5';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   2. Interactive SOW & Estimate Calculator
   -------------------------------------------------------------------------- */
/* LA-market cost basis. Every dollar the estimator quotes derives from these five
   numbers, so re-baselining after a July wage adjustment means editing here only.

   BURDENED_HOURLY: LA janitorial wage plus payroll tax, CA workers comp class 9008
   (a high-rate class), liability, uniforms and supervision. Roughly 1.45x the wage
   floor. Verify against actual loaded payroll each July when the LA City / LA County
   minimum wage CPI adjustment lands.
   Facilities inside the LA hotel & airport worker wage ordinance carry a materially
   higher floor and are NOT modeled here; quote those manually. */
const PRICING = {
  BURDENED_HOURLY: 28.00,   // fully loaded $/labor hour
  SUPPLIES_UPLIFT: 1.06,    // consumables, chemicals, liners, equipment amortization
  MARGIN_MULTIPLIER: 1.38,  // ~28% target gross margin
  VISITS_PER_MONTH: 4.333,  // weeks per month
  MIN_VISIT_HOURS: 1.5,     // no crew is dispatched for less; travel + setup + restrooms
  PORTER_HOURS_PER_MONTH: 173.4 // dedicated 8 hr/day porter, 5 days/wk
};

/* Pure pricing model. Kept free of DOM access so tools/calc-check.js can assert on it. */
function estimateFacility({ sqft, sqftPerHour, nightsPerWeek, soilFactor, porter, addonPerSqft }) {
  // Larger footprints clean faster per sq ft: less travel and setup amortized over more
  // area, and ride-on equipment becomes viable. Capped at a 25% gain.
  const effectiveRate = sqftPerHour * (1 + Math.min(0.25, sqft / 600000));

  const hoursPerVisit = Math.max(
    PRICING.MIN_VISIT_HOURS,
    (sqft / effectiveRate) * soilFactor
  );
  const visitsPerMonth = nightsPerWeek * PRICING.VISITS_PER_MONTH;
  const routineHours = hoursPerVisit * visitsPerMonth;

  // A day porter is a dedicated body, so its cost is flat and independent of footprint.
  const porterHours = porter ? PRICING.PORTER_HOURS_PER_MONTH : 0;
  const laborHours = routineHours + porterHours;

  const routinePrice =
    laborHours * PRICING.BURDENED_HOURLY * PRICING.SUPPLIES_UPLIFT * PRICING.MARGIN_MULTIPLIER;

  // Periodic specialty work scales with area; each add-on carries its own mobilization floor.
  // cadence is how many times a month the charge lands: a plain amortized add-on is 1, and
  // "schedule" means once per cleaning visit, riding the frequency chosen in step 03.
  // Fogging is deliberately NOT on "schedule": at nightly frequency a per-visit sq-ft rate
  // outruns the entire routine contract several times over.
  // `rate` is the older single-value shape and still works; low/high override it.
  const addonTotal = (end) => addonPerSqft.reduce((sum, a) => {
    const rate = a[end] !== undefined ? a[end] : a.rate;
    const times = a.cadence === 'schedule' ? visitsPerMonth : (a.cadence || 1);
    return sum + Math.max(a.min, sqft * rate) * times;
  }, 0);
  const addonLow = addonTotal('low');
  const addonHigh = addonTotal('high');

  // Size the crew so a shift lands near six hours, and hard-cap it at eight: California
  // pays daily overtime past eight, so a long solo shift is a cost trap, not a saving.
  // Lean schedules carry a soil penalty that can push a single body over the line.
  const nightCrew = Math.max(1, Math.round(hoursPerVisit / 6), Math.ceil(hoursPerVisit / 8));

  // The +/- band belongs to the labor estimate, which is what actually varies with a
  // walkthrough. An add-on quoted as a range carries its own ends instead of inheriting it.
  return {
    monthly: Math.round(routinePrice + (addonLow + addonHigh) / 2),
    monthlyLow: Math.round(routinePrice * 0.92 + addonLow),
    monthlyHigh: Math.round(routinePrice * 1.12 + addonHigh),
    laborHours: Math.round(laborHours),
    hoursPerVisit,
    hoursPerPerson: hoursPerVisit / nightCrew,
    crew: nightCrew + (porter ? 1 : 0) // the porter is a separate assigned body
  };
}

function initCalculator() {
  const sqftSlider = document.getElementById('calc-sqft-slider');
  const sqftDisplay = document.getElementById('calc-sqft-display');
  const rateDisplay = document.getElementById('calc-rate-display');
  const crewDisplay = document.getElementById('calc-crew-display');
  const visitsDisplay = document.getElementById('calc-visits-display');
  const hoursDisplay = document.getElementById('calc-hours-display');
  const facilityTypeInputs = document.querySelectorAll('input[name="facility-type"]');
  const frequencyInputs = document.querySelectorAll('input[name="frequency"]');
  const addonInputs = document.querySelectorAll('.addon-input');

  if (!sqftSlider) return;

  function calculateEstimate() {
    const sqft = parseInt(sqftSlider.value, 10);
    sqftDisplay.textContent = sqft.toLocaleString() + ' SQ FT';

    // Production rate: how many sq ft one specialist cleans per hour in this facility type.
    const selectedFacility = document.querySelector('input[name="facility-type"]:checked');
    const sqftPerHour = parseFloat(selectedFacility?.dataset.rate || '3500');

    // Frequency drives visit count; soil factor captures the load that accumulates
    // between visits, so each visit on a 2x schedule runs longer than one on a 5x.
    const selectedFreq = document.querySelector('input[name="frequency"]:checked');
    const nightsPerWeek = parseFloat(selectedFreq?.dataset.nights || '5');
    const soilFactor = parseFloat(selectedFreq?.dataset.soil || '1.0');
    const porter = selectedFreq?.dataset.porter === 'true';
    const visitsLabel = selectedFreq?.dataset.label || '5 Nights / Wk';

    const addonPerSqft = [];
    addonInputs.forEach(input => {
      if (input.checked) {
        const flat = input.dataset.persqft || '0';
        addonPerSqft.push({
          low: parseFloat(input.dataset.persqftLow || flat),
          high: parseFloat(input.dataset.persqftHigh || flat),
          min: parseFloat(input.dataset.min || '0'),
          cadence: input.dataset.cadence === 'schedule'
            ? 'schedule'
            : parseFloat(input.dataset.cadence || '1')
        });
      }
    });

    const est = estimateFacility({
      sqft, sqftPerHour, nightsPerWeek, soilFactor, porter, addonPerSqft
    });

    const lowEstimate = est.monthlyLow;
    const highEstimate = est.monthlyHigh;
    const shiftHours = Math.round(est.hoursPerPerson * 10) / 10;

    rateDisplay.textContent = `$${lowEstimate.toLocaleString()} – $${highEstimate.toLocaleString()}`;
    crewDisplay.textContent = `${est.crew} Assigned Specialist${est.crew > 1 ? 's' : ''}`;
    visitsDisplay.textContent = visitsLabel;
    hoursDisplay.textContent = `~${shiftHours} Hrs / Person`;
  }

  sqftSlider.addEventListener('input', calculateEstimate);
  facilityTypeInputs.forEach(i => i.addEventListener('change', calculateEstimate));
  frequencyInputs.forEach(i => i.addEventListener('change', calculateEstimate));
  addonInputs.forEach(i => i.addEventListener('change', calculateEstimate));

  calculateEstimate();
}

if (typeof module !== 'undefined') {
  module.exports = { estimateFacility, PRICING };
}

/* --------------------------------------------------------------------------
   3. Service Divisions Filter / Tab Switcher
   -------------------------------------------------------------------------- */
function initServiceTabs() {
  const tabBtns = document.querySelectorAll('.services-tabs-nav .tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      serviceCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   4. Master Checklist Matrix Tabs
   -------------------------------------------------------------------------- */
function initChecklistTabs() {
  const tabBtns = document.querySelectorAll('.checklist-tab-btn');
  const views = document.querySelectorAll('.checklist-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.dataset.target;
      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Southern California City Search
   -------------------------------------------------------------------------- */
function initCitySearch() {
  const searchInput = document.getElementById('city-search-input');
  const countyBoxes = document.querySelectorAll('.county-box');
  const searchResultNotice = document.getElementById('city-search-result');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      countyBoxes.forEach(box => {
        box.style.opacity = '1';
        box.style.borderColor = 'var(--border-dark)';
      });
      if (searchResultNotice) searchResultNotice.textContent = '';
      return;
    }

    let matchFound = false;
    let matchedCountyName = '';

    countyBoxes.forEach(box => {
      const cities = box.dataset.cities ? box.dataset.cities.toLowerCase() : '';
      const countyName = box.querySelector('.county-name')?.textContent || '';

      if (cities.includes(query) || countyName.toLowerCase().includes(query)) {
        box.style.opacity = '1';
        box.style.borderColor = 'var(--accent-purple-light)';
        box.style.boxShadow = '0 0 20px rgba(7, 132, 181, 0.4)';
        matchFound = true;
        matchedCountyName = countyName;
      } else {
        box.style.opacity = '0.35';
        box.style.borderColor = 'var(--border-dark)';
        box.style.boxShadow = 'none';
      }
    });

    if (searchResultNotice) {
      if (matchFound) {
        searchResultNotice.innerHTML = `<span style="color:#00FF88;">✓ Direct Dispatch Available</span> for "${query.toUpperCase()}" via our ${matchedCountyName} Regional Hub.`;
      } else {
        searchResultNotice.innerHTML = `<span style="color:#FFB800;">Enterprise statewide routing available.</span> Contact dispatch for custom radius.`;
      }
    }
  });
}

/* --------------------------------------------------------------------------
   6. FAQ Accordions
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Modals: Walkthrough Booking & Emergency Dispatch
   -------------------------------------------------------------------------- */
function initModals() {
  const walkthroughModal = document.getElementById('walkthrough-modal');
  const emergencyModal = document.getElementById('emergency-modal');

  // Trigger buttons
  document.querySelectorAll('[data-open-modal="walkthrough"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(walkthroughModal);
    });
  });

  document.querySelectorAll('[data-open-modal="emergency"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(emergencyModal);
    });
  });

  // Close buttons
  document.querySelectorAll('.modal-close-btn, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Click outside to close
  [walkthroughModal, emergencyModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Modal form submissions with instant feedback
  const proposalForm = document.getElementById('proposal-form');
  if (proposalForm) {
    proposalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = proposalForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<span>DISPATCHING AUDIT TEAM...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        proposalForm.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem;">
            <div style="font-size: 2.5rem; color: #00FF88; margin-bottom: 1rem;">✓</div>
            <h3 style="font-family: var(--font-title); font-size: 1.4rem; color: #FFFFFF; margin-bottom: 1rem;">FACILITY AUDIT CONFIRMED</h3>
            <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem;">
              A senior commercial operations manager has received your facility specs and will deliver your written SOW proposal within 24 hours. Your 20% first-month promotional rate has been locked in.
            </p>
            <p style="font-family: var(--font-accent); font-size: 0.85rem; color: var(--accent-purple-light);">
              Confirmation Ref: HYG-${Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>
        `;
      }, 1000);
    });
  }

  const emergencyForm = document.getElementById('emergency-form');
  if (emergencyForm) {
    emergencyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = emergencyForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<span>ALERTING DISPATCH UNIT...</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        emergencyForm.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem;">
            <div style="font-size: 2.5rem; color: #00FF88; margin-bottom: 1rem;">⚡</div>
            <h3 style="font-family: var(--font-title); font-size: 1.4rem; color: #FFFFFF; margin-bottom: 1rem;">EMERGENCY DISPATCH INITIATED</h3>
            <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem;">
              Our on-call supervisor will contact you at the number provided in under 5 minutes. Rapid response vehicle is on standby.
            </p>
            <p style="font-family: var(--font-accent); font-size: 0.85rem; color: #00FF88;">
              Priority Dispatch Ref: EMG-${Math.floor(10000 + Math.random() * 90000)}
            </p>
          </div>
        `;
      }, 800);
    });
  }
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

/* --------------------------------------------------------------------------
   8. Mobile / Tablet Desktop Viewing Advisory
   -------------------------------------------------------------------------- */
function initDeviceAdvisory() {
  const advisoryModal = document.getElementById('device-advisory-modal');
  const ignoreBtn = document.getElementById('btn-advisory-ignore');
  const closeX = document.getElementById('advisory-close-x');

  if (!advisoryModal) return;

  const isSmallDevice = () => {
    const isTouchUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallViewport = window.innerWidth <= 1024;
    return isSmallViewport || isTouchUserAgent;
  };

  const isDismissed = sessionStorage.getItem('hygia_advisory_dismissed');

  if (isSmallDevice() && !isDismissed) {
    setTimeout(() => {
      openModal(advisoryModal);
    }, 400);
  }

  window.addEventListener('resize', () => {
    if (isSmallDevice() && !sessionStorage.getItem('hygia_advisory_dismissed')) {
      openModal(advisoryModal);
    }
  });

  function dismiss() {
    sessionStorage.setItem('hygia_advisory_dismissed', 'true');
    closeAllModals();
  }

  if (ignoreBtn) ignoreBtn.addEventListener('click', dismiss);
  if (closeX) closeX.addEventListener('click', dismiss);
}
