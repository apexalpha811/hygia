/* Self-check for the SOW estimator pricing model.  Run: node tools/calc-check.js
   Guards the one thing that actually matters: the quote must clear burdened LA labor
   cost at every point on the slider. The old $/sq ft model failed this at every size. */

const assert = require('assert');
const { estimateFacility, PRICING } = require('../js/main.js');

const OFFICE = 3500;
const MEDICAL = 1900;

const base = (over) => Object.assign({
  sqft: 25000,
  sqftPerHour: OFFICE,
  nightsPerWeek: 5,
  soilFactor: 1.0,
  porter: false,
  addonPerSqft: []
}, over);

// 1. The quote must exceed burdened labor cost across the whole slider, in every
//    facility type. This is the regression the rebuild exists to fix.
for (const rate of [OFFICE, MEDICAL, 6000]) {
  for (const sqft of [2500, 10000, 25000, 50000, 100000, 150000]) {
    for (const [nights, soil] of [[2, 1.25], [3, 1.15], [5, 1.0], [7, 0.95]]) {
      const e = estimateFacility(base({ sqft, sqftPerHour: rate, nightsPerWeek: nights, soilFactor: soil }));
      const laborCost = e.laborHours * PRICING.BURDENED_HOURLY;
      assert(
        e.monthly > laborCost * 1.15,
        `underwater: ${sqft}sqft rate=${rate} ${nights}x -> $${e.monthly} vs $${Math.round(laborCost)} labor`
      );
    }
  }
}

// 2. No crew is dispatched for a token visit; small sites hit the minimum-visit floor.
assert.strictEqual(estimateFacility(base({ sqft: 2500 })).hoursPerVisit, PRICING.MIN_VISIT_HOURS);

// 3. A day porter is a flat dedicated body, so it must add the same cost to a small
//    site as to a large one. The old model made it a multiplier and undercharged badly.
const smallDelta = estimateFacility(base({ sqft: 5000, porter: true })).monthly
                 - estimateFacility(base({ sqft: 5000 })).monthly;
const largeDelta = estimateFacility(base({ sqft: 120000, porter: true })).monthly
                 - estimateFacility(base({ sqft: 120000 })).monthly;
assert(Math.abs(smallDelta - largeDelta) < 2, `porter cost must be footprint-independent: ${smallDelta} vs ${largeDelta}`);
assert(smallDelta > 6000, `porter should price near a full-time body, got $${smallDelta}`);

// 4. Add-ons scale with area rather than sitting flat.
const addon = [{ rate: 0.05, min: 325 }];
assert(
  estimateFacility(base({ sqft: 150000, addonPerSqft: addon })).monthly
  - estimateFacility(base({ sqft: 150000 })).monthly
  > estimateFacility(base({ sqft: 5000, addonPerSqft: addon })).monthly
  - estimateFacility(base({ sqft: 5000 })).monthly * 1,
  'add-on must scale with square footage'
);

// 5. Medical costs more per sq ft than office at identical footprint and schedule.
assert(
  estimateFacility(base({ sqftPerHour: MEDICAL })).monthly >
  estimateFacility(base({ sqftPerHour: OFFICE })).monthly * 1.5,
  'medical compliance overhead not reflected'
);

// 6. Nobody is scheduled into California daily overtime on a routine shift. Swept across
//    schedules and facility types, because the soil penalty on a lean schedule is what
//    pushed a single body past eight hours the first time round.
for (const rate of [OFFICE, MEDICAL, 6000, 2600]) {
  for (const sqft of [2500, 10000, 25000, 50000, 75000, 100000, 150000]) {
    for (const [nights, soil] of [[2, 1.25], [3, 1.15], [5, 1.0], [7, 0.95]]) {
      const e = estimateFacility(base({ sqft, sqftPerHour: rate, nightsPerWeek: nights, soilFactor: soil }));
      assert(
        e.hoursPerPerson <= 8,
        `CA daily OT: ${sqft}sqft rate=${rate} ${nights}x -> ${e.hoursPerPerson.toFixed(1)} hrs/person`
      );
    }
  }
}

// 7. The day porter is an additional assigned body and must show up in the crew count.
assert.strictEqual(
  estimateFacility(base({ porter: true })).crew,
  estimateFacility(base({ porter: false })).crew + 1,
  'porter not counted as assigned personnel'
);

console.log('calc-check: all assertions passed');

// Reference table for re-baselining against real bids.
const fmt = (n) => '$' + n.toLocaleString();
console.log('\nOffice, 5 nights/wk:');
for (const sqft of [2500, 10000, 25000, 50000, 150000]) {
  const e = estimateFacility(base({ sqft }));
  console.log(
    `  ${String(sqft).padStart(7)} sqft  ${fmt(Math.round(e.monthly * 0.92)).padStart(9)} - ${fmt(Math.round(e.monthly * 1.12)).padEnd(9)}` +
    `  $${(e.monthly / sqft).toFixed(3)}/sqft  ${e.crew} crew x ${e.hoursPerPerson.toFixed(1)} hrs`
  );
}
