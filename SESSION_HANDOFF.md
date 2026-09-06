# HYGIA Project Session Handoff

> **Target Audience**: Any AI assistant (Claude Code, Gemini, ChatGPT, Codex, Antigravity) or developer picking up this project.  
> **Repository**: [https://github.com/apexalpha811/hygia.git](https://github.com/apexalpha811/hygia.git)  
> **Last Updated**: 2026-09-06  
> **Branch**: `main` (clean working tree, fully pushed to remote)

---

## 1. Executive Summary & Project Purpose

**HYGIA Commercial Facility Services** is a dark-aesthetic, high-converting, single-page enterprise web application for a premier commercial cleaning and janitorial company serving Southern California (Los Angeles, Orange, Inland Empire, San Diego, and Ventura Counties).

The site is built with vanilla **HTML5**, **CSS3**, and **ES6 JavaScript** (zero heavy external frameworks required) for maximum performance, clean maintenance, and instantaneous loading on static hosting platforms like **Vercel** or **GitHub Pages**.

---

## 2. Core Brand & Design Guardrails (STRICT)

All future modifications **MUST** adhere strictly to the rules documented in [`design-cues.md`](./design-cues.md):

### A. Typography Hierarchy
1. **Company Brand Name ("HYGIA")**:
   - **Font**: `Ethnocentric` (`font-family: var(--font-brand) !important;`)
   - **Weight**: Bold (`700`), wide uppercase tracking (`letter-spacing: 0.22em`).
   - **Scope**: **STRICTLY AND EXCLUSIVELY** used for the company brand wordmark in the header (`.hygia-brand`), hero banner display (`.hero-brand-display`), and footer.
   - **Local Asset**: `fonts for hygia/Ethnocentric/` (`Ethnocentric.ttf`, `hygia Font for title.ttf`).
2. **All Headings, Section Titles & Subtitles (`h1`, `h2`, `h3`, `h4`, `.section-heading`)**:
   - **Font**: `Proxima Nova` (`font-family: var(--font-title);`, with fallbacks to `Montserrat`, `sans-serif`).
   - **Weight**: Bold/ExtraBold (`800`), `ALL CAPS`, `letter-spacing: 0.08em`.
   - **Source**: Imported via `@font-face` and CDN in `css/fonts.css`.
3. **Body Copy & Paragraphs**:
   - **Font**: `Montserrat` (`font-family: var(--font-body);`).
   - **Weight**: Strict **600** (Semi-Bold) for high contrast and readability on dark/light surfaces.
   - **Size**: `1.0625rem` (~17px), line-height `1.65`.
4. **Interactive Accents, Buttons, Metrics & Badges**:
   - **Font**: `Orbitron` (`font-family: var(--font-accent);`).
   - **Scope**: Outline buttons, category filter tabs, numerical statistics, countdowns, and calculator readouts.

### B. Color Palette
- **Primary Background**: `#000000` (Pure Black).
- **Primary Accent**: `#0784b5` (Ocean Cyan / Cerulean Blue) — *Swapped from the original purple per client request*.
- **Bright Accent Highlight**: `#0ca0dc` (rgb(12, 160, 220)).
- **Accent Depth Anchor**: `#055c7f` (rgb(5, 92, 127)).
- **Full Accent Blocks**: `.section-accent-block` featuring gradients of `#0784b5` to `#055c7f` with cyan radial glows.
- **Light Sections**: `#F6F8FC` with dark text `#04030A`.
- **Accent Border/Glow**: `rgba(7, 132, 181, 0.45)` for subtle futuristic glow effects.
- **NO PINK**: Zero pink anywhere in the stylesheet.

### C. Button & Component Rules
- **OUTLINE BUTTONS ONLY**: **No filled/solid buttons allowed anywhere**.
  - On Dark / Accent sections: White outline (`border: 2px solid #FFFFFF; background: transparent;`).
  - On Light sections: Cyan/Blue outline (`border: 2px solid #0784b5; color: #0784b5; background: transparent;`).
  - Hover states: Subtle glow and slight border brightening (`translateY(-2px)`).

### D. Content & Sector Constraints
- **100% Commercial Only**: Corporate offices, medical pavilions/outpatient, logistics & distribution hubs, multi-tenant properties.
- **NO Aerospace**: All references to aerospace, biotech, and ISO Class 5–8 cleanrooms were explicitly **removed** per client mandate. Do **NOT** reintroduce them.
- **W-2 Employees Only**: Direct employees with zero subcontracting. The W-2 FAQ answer was strictly tailored to:
  > *"100% of HYGIA cleaning specialists are direct, verified W-2 company employees. We NEVER broker out contracts to random independent subcontractors."*
- **Enterprise Validation / Testimonials**: The entire client proof/reviews section was removed per client request.

---

## 3. Key Website Architecture & Modules

The page flows through alternating dark, accent, and light high-contrast sections:

1. **Mobile/Tablet Desktop Advisory Modal (`#deviceAdvisoryModal`)**:
   - Automatically detects screens `< 1024px` on initial load.
   - Displays a sleek modal advising the user that the enterprise platform is best experienced on desktop.
   - Provides a *"CONTINUE ON MOBILE ANYWAY"* button that sets `sessionStorage.getItem('hygia_device_dismissed')` to allow full browsing without reappearing during the session.
2. **Streamlined Navigation Header (`.site-header`)**:
   - Minimalist layout: HYGIA wordmark + 4 high-value navigation links (`SERVICES`, `THE STANDARD`, `ESTIMATOR`, `COVERAGE`).
   - 24/7 hotline callout: `(888) 494-HYGIA` separated by a vertical divider from the `[SCHEDULE AUDIT]` outline button.
   - Mobile hamburger menu toggle with off-canvas navigation on small viewports.
3. **Hero Section (`#hero`)**:
   - High-impact dark backdrop image (`assets/images/hero-lobby.jpg`) with ambient radial cyan depth.
   - "HYGIA" display wordmark in `Ethnocentric` + headline in `Proxima Nova`.
   - Dual outline action buttons: `[ESTIMATE YOUR SOW]` and `[BOOK FACILITY WALKTHROUGH]`.
   - 4-metric enterprise proof strip: 24-hr proposal SLA, 5-min dispatch response, 99.99% kill efficacy, 5-county regional hubs.
4. **Compliance Credentials Strip (`#credentials`)**:
   - BSCAI, ISSA, IICRC, EPA List N, ITAR compliance badges.
5. **Accent Block 1 (`#standards`)**:
   - Background: `#0784b5` gradient.
   - The 4-Step Operational Standard: 01. Facility Audit &bull; 02. Fixed SOW Spec &bull; 03. Assigned Crew &bull; 04. Closed-Loop QA.
6. **Light Section 1 (`#services`)**:
   - Background: `#F6F8FC` with `#04030A` text.
   - Interactive category filter tabs (All, Routine Janitorial, Healthcare & Medical, Restoration & Exterior).
   - 6 service division cards: Commercial Janitorial, Medical Disinfection, Multi-Tenant Facilities, Day Porter Staffing, Floor Restoration, High-Reach Windows.
7. **Dark Section 2 (`#science`)**:
   - The 3 Tiers of Hygiene Science: Tier 1 Visible Sanitation &bull; Tier 2 Pathogen Eradication &bull; Tier 3 ATP Digital Verification.
   - Color-Coded Microfiber Matrix: Red (Restrooms), Blue (General/Offices), Yellow (High-Touch Medical), Green (Food/Breakrooms).
8. **Accent Block 2 (`#calculator`)**:
   - Background: `#0784b5` gradient.
   - Interactive SOW & Estimate Calculator (`js/main.js`):
     - Sliders: Square footage (2,500 – 150,000 sq ft) and cleaning frequency (1x/wk to 7x/wk).
     - Add-ons: Medical Terminal Disinfection, Day Porter Staffing, Deep Floor Scrub/Wax.
     - Live dynamic budget range estimation and *"LOCK IN THIS SOW & SCHEDULE AUDIT"* form.
9. **Light Section 2 (`#checklists`)**:
   - Daily, Weekly, and Monthly verified execution checklists with interactive tabs.
10. **Dark Section 3 (`#coverage`)**:
    - Southern California Coverage: Los Angeles, Orange, Inland Empire, San Diego, and Ventura Counties.
    - Live interactive city search input that highlights matching county cards in real time.
11. **Light Section 3 (`#faq`)**:
    - Accordion FAQ covering W-2 employee policies, scope definitions, security protocols, and 24-hr mobilization SLA.
12. **Accent Block 3 (`#cta`)**:
    - Final conversion banner with direct hotline and audit schedule trigger.
13. **Footer (`.site-footer`)**:
    - Regional hub listings, compliance credentials, copyright, and emergency dispatch hotline.
14. **Schedule Audit Modal (`#auditModal`)**:
    - Full facility walkthrough request modal with dynamic confirmation feedback.

---

## 4. File Structure

```
c:\Users\kv8n11\hygia\
├── index.html                  # Single-page semantic HTML structure
├── css/
│   ├── style.css               # Core design tokens, layout, typography, components, media queries
│   └── fonts.css               # Local & CDN @font-face declarations and Google Fonts imports
├── js/
│   └── main.js                 # Header scroll, mobile advisory modal, calculator, tab filters, city search, FAQ
├── assets/
│   └── images/                 # Generated photographic assets (hero-lobby, corporate-office, etc.)
├── fonts for hygia/            # Local TTF font files
│   ├── Ethnocentric/           # Ethnocentric font family (strictly for "HYGIA")
│   ├── Montserrat/             # Montserrat regular, medium, bold
│   └── Orbitron/               # Orbitron regular, medium, bold
├── design-cues.md              # Master design guidelines and style rules
├── SESSION_HANDOFF.md          # THIS FILE - comprehensive AI/dev handoff guide
└── [Reference files]           # Scraped competitor intelligence (.md files for reference only)
```

---

## 5. Recent Commit History

| Commit | Message | Notes |
| :--- | :--- | :--- |
| `553b454` | `Keep Ethnocentric strictly for company name HYGIA and use Proxima Nova for all headings` | Latest typography alignment |
| `f2a6360` | `Swap Ethnocentric font to Proxima Nova for HYGIA brand wordmark` | Intermediate font step |
| `7b8a56f` | `Remove Enterprise Validation (testimonials/proof) section and associated CSS` | Removed reviews per user request |
| `2ebba1e` | `Update W-2 employee FAQ text per specification` | Stripped insurance/bonding details from FAQ |
| `c1bedfc` | `Restrict Ethnocentric strictly to HYGIA brand name and switch all headings to Orbitron` | Initial restriction of Ethnocentric |
| `c480f7e` | `Update design cues with #0784b5 color palette` | Updated markdown design spec |
| `0e38464` | `Swap accent color palette from purple to #0784b5` | Global palette swap to cyan/blue |
| `c730354` | `Add mobile and tablet desktop viewing advisory modal` | Added screen `< 1024px` advisory modal |

---

## 6. How to Run, Test, and Deploy

### Local Development
Run any static file server from the repository root:
```bash
# Using Python
python -m http.server 8080

# Or using Node.js / npx
npx serve .
```
Access at `http://localhost:8080/`.

### Deployment
The project is set up to automatically deploy to **Vercel** when pushed to the GitHub `main` branch:
```bash
git add <files>
git commit -m "Your descriptive commit message"
git push origin main
```
Only standard frontend assets (`index.html`, `css/`, `js/`, `assets/`, `fonts for hygia/`) are required for the web build.

---

## 7. Instructions for the Next AI Assistant

1. **Do NOT Revert Color Scheme**: The primary accent is `#0784b5` (ocean cyan/blue). Do not reintroduce purple, indigo, or pink.
2. **Do NOT Revert Button Styles**: All buttons must remain outline style (`.btn-outline`). Never convert them to solid filled buttons.
3. **Respect Typography Assignments**:
   - Company name "HYGIA" = `Ethnocentric` (`var(--font-brand)`).
   - Headings & Titles = `Proxima Nova` (`var(--font-title)`).
   - Body copy = `Montserrat` (`font-weight: 600`).
   - Buttons, Metrics, Badges = `Orbitron` (`var(--font-accent)`).
4. **Do NOT Reintroduce Excluded Sectors**: Aerospace, biotech, and ISO cleanrooms must remain excluded.
5. **Always Test Locally and Push to GitHub**: Verify changes visually before committing and pushing cleanly to `origin/main`.
