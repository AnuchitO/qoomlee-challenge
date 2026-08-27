# STITCH PROMPT — QOOMLEE AIRLINE SYSTEM (COMPLETE)

> **⚠️ Aspirational:** This design spec describes 38 screens for a full-featured airline app. The current implementation has ~12 screens covering the core booking flow (search → book → pay). The remaining screens are future work. See [ROADMAP.md](ROADMAP.md) for priorities.

## HOW TO USE THIS FILE
Each `### SCREEN` section below is one Stitch generation. The folder name after `SCREEN:` is the exact output directory name to use. Generate screens in order — later screens reference design decisions made in earlier ones.

---

## GLOBAL DESIGN SYSTEM (include in every screen)

**Brand:** Qoomlee Airline — modern, trustworthy, sky-themed. Serves travelers between Southeast Asian tier-2 cities and Australian gateways.

**Stack:** Tailwind CSS (CDN with plugins=forms,container-queries), Inter font (Google Fonts), Material Symbols Outlined icons (Google Fonts, wght,FILL@100..700,0..1).

**Tailwind config (copy exactly into every screen's `<script id="tailwind-config">`)**:
```js
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0057a2",
        "on-primary": "#ffffff",
        "primary-container": "#0e70ca",
        "on-primary-container": "#f0f4ff",
        "primary-fixed": "#d4e3ff",
        "primary-fixed-dim": "#a5c8ff",
        "on-primary-fixed": "#001c3a",
        "on-primary-fixed-variant": "#004786",
        "secondary": "#465f84",
        "on-secondary": "#ffffff",
        "secondary-container": "#b9d3fd",
        "on-secondary-container": "#425b7f",
        "secondary-fixed": "#d4e3ff",
        "secondary-fixed-dim": "#aec8f2",
        "on-secondary-fixed": "#001c3a",
        "on-secondary-fixed-variant": "#2e486b",
        "tertiary": "#784f00",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#986500",
        "on-tertiary-container": "#fff2e5",
        "tertiary-fixed": "#ffddb2",
        "tertiary-fixed-dim": "#ffb94c",
        "on-tertiary-fixed": "#291800",
        "on-tertiary-fixed-variant": "#624000",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "background": "#f8f9ff",
        "on-background": "#0b1c30",
        "surface": "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#414752",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        "inverse-primary": "#a5c8ff",
        "outline": "#717783",
        "outline-variant": "#c1c6d4",
        "surface-tint": "#005faf"
      },
      borderRadius: {
        "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"
      },
      spacing: {
        "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px",
        "xl": "32px", "xxl": "48px",
        "container-margin-mobile": "16px", "container-margin-desktop": "32px",
        "base": "8px", "gutter": "16px"
      },
      fontFamily: {
        "body-md": ["Inter"], "body-lg": ["Inter"],
        "label-sm": ["Inter"], "label-md": ["Inter"],
        "headline-md": ["Inter"], "headline-lg": ["Inter"],
        "headline-lg-mobile": ["Inter"], "mono-data": ["Inter"]
      },
      fontSize: {
        "body-md":           ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg":           ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-sm":          ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-md":          ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "headline-md":       ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg":       ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile":["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "mono-data":         ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }]
      }
    }
  }
}
```

**Global CSS (add inside `<style>` in every screen):**
```css
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.hero-gradient { background: linear-gradient(180deg, #0E70CA 0%, #1D4ED8 100%); }
body { min-height: max(884px, 100dvh); }
```

**Shared Header (sticky top, z-50, h-16):**
- Left: hamburger icon button (rounded-full hover) + "Qoomlee" text in primary, headline-lg-mobile
- Right: user avatar (40×40, rounded-full, border outline-variant) OR back arrow for sub-pages

**Shared Bottom Nav (fixed bottom, h-20, rounded-t-xl, shadow):**
- 4 tabs: Search (flight_takeoff icon), Bookings (confirmation_number), Check-in (how_to_reg), Passes (qr_code_2)
- Active tab: primary color, FILL=1 icon, bg primary-container/20, rounded-full pill
- Inactive tabs: on-surface-variant, FILL=0

**Design rules:**
- Mobile-first, 375px width, 16px outer margins
- 8px grid — all spacing multiples of 8
- Cards: surface-container-lowest bg, 1px border outline-variant, rounded-xl, shadow-sm
- Input fields: rounded-xl, border outline-variant, focus:border-primary focus:ring-2 focus:ring-primary/10
- Primary button: bg primary-container, text on-primary-container, rounded-xl, h-14, font headline-md, shadow-sm, active:scale-95
- Secondary button: border outline, text on-surface, rounded-xl, hover:bg-surface-container-low
- Labels always visible above inputs (font label-sm, text on-surface-variant)
- Touch targets: min 44px height/width
- Progress stepper: sky blue line, numbered circles for booking flow

---

# ═══════════════════════════════════════════
# BOOKING FLOW
# ═══════════════════════════════════════════

---

### SCREEN: flight_search
**Context:** App home screen. Step 0 of booking flow.

**Header:** Standard shared header with hamburger + "Qoomlee" logo + user avatar.

**Hero Banner** (hero-gradient bg, px-16 pt-32 pb-48 relative overflow-hidden):
- h1 "Flight Search" in white, headline-lg-mobile
- p "Find your perfect flight" in white/90, body-md
- Decorative flight_takeoff icon (120px, white/20) positioned absolutely at bottom-right, rotated 12°
- Subtle white gradient fade at bottom overlapping the card below

**Search Card** (surface-container-lowest, rounded-xl, shadow-sm, border outline-variant, p-16, -mt-32 relative z-20, mx-16):

1. **Trip type toggle** (surface-container-low, p-1, rounded-lg): "Round trip" (active: bg primary-container text on-primary-container rounded-md shadow-sm) | "One way" (inactive: text on-surface-variant)

2. **From field** (label "From" above, icon flight_takeoff primary, placeholder "Departure City e.g. Bangkok (BKK)")
   - Swap button (absolute, rounded-full, border outline-variant, shadow-sm) between From and To with swap_vert icon

3. **To field** (label "To" above, icon flight_land primary, placeholder "Arrival City e.g. Sydney (SYD)")

4. **Date row** (2-column grid, gap-16):
   - "Departure" label + calendar_today icon + "Tue, Oct 24" value in on-surface
   - "Return" label + calendar_today icon + "Tue, Oct 31" value in on-surface
   - Each tappable → opens date_calendar screen

5. **Travelers & Class** (full-width chip row):
   - person icon + "1 Adult · Economy" + expand_more icon
   - Tappable → opens traveler_selector screen

6. **"Search Flights" button** (primary, full-width, h-56, rounded-xl, headline-md)

**Popular Destinations section** (mt-48, px-16):
- Heading "Popular Destinations" (headline-md) + "See all" link (primary, label-md) in a flex row
- Bento grid: 1 large full-width card (h-192) + 2 half-width cards below (h-160)
  - Bangkok (large): panoramic skyline at dusk, "Trending" badge (white/20 backdrop-blur pill top-right), "From ฿8,500" label
  - Sydney: Opera House, "From ฿15,200"
  - Chiang Mai: temple and mountains, "From ฿4,900"
  - Each card: gradient overlay bottom-to-top black/80, destination name + price in white

**Travel Tip banner** (tertiary-fixed bg, rounded-xl, p-24, flex gap-16):
- lightbulb icon in tertiary-container circle (w-48 h-48)
- "Travel Tip" label-md + body copy "Book 3+ weeks ahead for the best fares on Southeast Asia routes."

**Bottom Nav:** Search tab active.

---

### SCREEN: date_calendar
**Context:** Modal bottom sheet opened from flight_search when tapping a date field. Shows full-month calendar for selecting departure/return dates.

**Header:** Back arrow (arrow_back) + "Select Dates" title (headline-md) + "Clear" text button (primary, label-md) right-aligned. No bottom nav.

**Month navigation row** (flex justify-between items-center, px-16, py-8):
- chevron_left button | "October 2024" (headline-md) | chevron_right button

**Calendar grid** (7-column, px-16):
- Row 0: S M T W T F S — label-sm, on-surface-variant, text-center
- Day cells: 44×44 min, rounded-full, label-md
  - Default: text on-surface, bg transparent
  - Today: border primary, text primary
  - Selected (departure): bg primary-container, text on-primary-container, rounded-full
  - Selected (return): bg primary-container, text on-primary-container, rounded-full
  - Range (between departure and return): bg primary-fixed/30 text on-primary-fixed, square sides, rounded only at start and end
  - Past dates: text outline, not tappable
  - Disabled (unavailable): text outline/50, strikethrough

**Second month below** (same structure, for return date selection if round trip)

**Summary bar** (sticky bottom of sheet above action button, surface-container-low, p-16):
- "Departure" chip: departure date or "Select date" placeholder
- arrow_forward icon
- "Return" chip: return date or "Select date" placeholder

**"Confirm Dates" button** (primary, full-width, h-56, rounded-xl, mx-16 mb-16, disabled/greyed if no dates selected)

**Interaction states:**
- Tapping a date first time = sets departure
- Tapping another date = sets return (must be ≥ departure)
- If one way mode: only departure is selectable

---

### SCREEN: traveler_selector
**Context:** Bottom sheet modal from flight_search. Allows selecting number of adults, children, and infants, plus cabin class.

**Header:** drag handle at top (w-32 h-4 rounded-full bg outline-variant mx-auto mt-8) + "Travelers & Class" (headline-md, mt-16, px-16). No full header bar.

**Traveler rows** (each: flex justify-between items-center, py-16, border-b border-outline-variant/30):

1. **Adults** (18+):
   - Left: label "Adults" (body-md) + "18 years and above" subtitle (label-sm, on-surface-variant)
   - Right: minus button (rounded-full, border outline-variant, w-36 h-36) + count "1" (headline-md, w-32 text-center) + plus button (same)
   - Min 1 adult; minus disabled at 1

2. **Children** (2–11):
   - Left: "Children" + "Ages 2–11 years"
   - Right: same stepper, count "0", min 0
   - When count > 0: show age selector chips below for each child (dropdown "Age 2", "Age 3"… "Age 11")

3. **Infants** (under 2):
   - Left: "Infants" + "Under 2 years"
   - Right: same stepper, count "0", min 0, max = adults count
   - When count > 0: per-infant choice "Lap" or "Seat" (toggle chip, label-md)
   - Warning banner if infants = adults: "Each infant must be accompanied by an adult"

**Cabin Class section** (mt-24, px-16):
- Label "Cabin Class" (label-md, on-surface-variant, mb-8)
- 3 option cards stacked (border outline-variant, rounded-xl, p-16 each):
  - **Economy** (selected by default — border-2 primary, bg primary-fixed/10):
    - Icon: airline_seat_recline_normal
    - "Economy" (label-md) + "Standard comfort · 20kg checked baggage" (label-sm, on-surface-variant)
    - "From ฿4,900" (label-sm, tertiary)
  - **Premium Economy**:
    - Icon: airline_seat_recline_extra
    - "Premium Economy" + "Extra legroom · 25kg baggage"
    - "From ฿8,200"
  - **Business**:
    - Icon: airline_seat_flat
    - "Business Class" + "Lie-flat seat · 30kg baggage · Lounge access"
    - "From ฿22,500"

**"Confirm" button** (primary, full-width, h-56, rounded-xl, mx-16, mb-32)
- Shows summary: "2 Adults, 1 Child · Economy" below button in label-sm on-surface-variant

---

### SCREEN: flight_results
**Context:** Step 1 of booking flow. Results list after search.

**Header:** Back arrow + flight summary chip ("BKK → SYD · Thu Oct 24 · 1 Adult · Economy") as headline-sm. "Edit" text link (primary, label-md) right-aligned. No avatar.

**Filter/Sort bar** (sticky below header, surface-container-lowest, border-b outline-variant, px-16, py-8, flex gap-8 overflow-x-auto no-scrollbar):
- Sort chip (tune icon): "Best" (active, bg primary-container text on-primary-container, rounded-full, label-md)
- Filter chips (each rounded-full, border outline-variant, label-md): "Price", "Departure", "Stops", "Duration", "Airlines"
- Active chip has bg primary-container, text on-primary-container; inactive has bg surface, border outline-variant

**Results count** (px-16, py-8, label-sm on-surface-variant): "23 flights found"

**Flight cards** (space-y-12, px-16):
Each card (surface-container-lowest, rounded-xl, border outline-variant, p-16 shadow-sm):

- **Row 1** (flex justify-between items-start):
  - Left: Airline badge (12×12 rounded bg secondary/10 text secondary label-sm) + flight number "QQ101" (mono-data)
  - Right: Price "฿8,450" (headline-md, primary) + "/person" (label-sm, on-surface-variant)

- **Row 2** (flex items-center gap-8, mt-12):
  - Departure: "08:00" (headline-lg-mobile, on-surface) + "BKK" (label-md, on-surface-variant)
  - Center: duration line with flight icon + "8h 30m" (label-sm, on-surface-variant) + "Non-stop" chip (success green bg/10 text, rounded-full, label-sm)
  - Arrival: "16:30+1" (headline-lg-mobile) + "SYD" (label-md, on-surface-variant), "+1" in error color if next-day

- **Row 3** (flex justify-between items-center, mt-12, pt-12, border-t border-outline-variant/30):
  - Left: luggage icon + "20kg" chip + airline_seat_recline_normal icon + "Economy" (all label-sm, on-surface-variant)
  - Right: "Select →" button (primary-container bg, on-primary-container text, rounded-lg, px-16 py-8, label-md)

- **Expandable details** (expand_more icon, label-sm primary): tapping reveals SUB row with aircraft type, refund policy badge, on-time percentage

**Featured badge** for best-value flight: gold (tertiary-fixed bg) "Best Value" pill top-right corner of card.

**Flight with 1 stop** (example card): show layover info "· 2h 15m layover in KUL" in on-surface-variant between time and arrival.

**"Load more flights" button** (outlined, surface, full-width, label-md, bottom of list)

**Bottom Nav:** Search active.

---

### SCREEN: flight_detail
**Context:** Full-screen detail view of a flight, opened by tapping "Show details" chevron on a result card.

**Header:** Back arrow + "Flight Details" (headline-md). No avatar. No bottom nav.

**Airline header card** (secondary bg, p-16, rounded-b-xl):
- Airline name "Qoomlee" + logo placeholder circle + flight number "QQ101" (mono-data, tertiary-fixed)
- Aircraft type "Boeing 737-800" (label-sm, white/70)

**Route timeline card** (surface-container-lowest, mx-16, rounded-xl, border, p-16, mt-16):
- Left column: departure time "08:00" (headline-lg-mobile primary) + city "Bangkok" + airport "Suvarnabhumi (BKK) · Terminal 1" (label-sm on-surface-variant)
- Center: vertical dashed line (border-dashed border-outline-variant) with flight icon in middle, "8h 30m" label, "Non-stop" chip
- Right of timeline: arrival "16:30" + "Sydney" + "Kingsford Smith (SYD) · Terminal 1" + "+0 day" indicator

**Key details grid** (2-column, gap-12, mx-16, mt-16):
- check_bag "Checked Baggage" + "20kg included"
- backpack "Carry-on" + "7kg, 56×45×25cm"
- airline_seat_recline_normal "Seat" + "Economy class"
- cancel "Refund" + "Partially refundable" chip (warning amber)
- swap_horiz "Changes" + "Fee applies" chip
- speed "On-time" + "89% on-time rate" (success green)

**Fare breakdown card** (mx-16, mt-16, rounded-xl, border, p-16):
- "Price Breakdown" header (label-md)
- "Base fare · 1 Adult": ฿7,200
- "Taxes & fees": ฿1,250
- Divider
- "Total": ฿8,450 (headline-md, primary)
- "Price valid for 15 minutes" (label-sm, on-surface-variant)

**Travel requirements summary** (mx-16, mt-16, surface-container rounded-xl p-16 border):
- "Travel Requirements" header + info icon
- Row: passport icon "Passport validity" → "6+ months required" ✅ or ⚠️
- Row: "Visa" → "ETA required for AU (apply online, ≈ AUD 20)"
- Row: "Health" → "No vaccination requirements"

**"Select This Flight" button** (primary, full-width, h-56, rounded-xl, mx-16, mb-32, sticky bottom)

---

### SCREEN: flight_filters
**Context:** Full-screen filter modal opened from flight_results filter bar.

**Header:** Close icon (X, top-left) + "Filters" (headline-md, centered) + "Reset all" text button (primary, label-md, right).

**Filter sections** (scrollable, px-16, space-y-24):

1. **Price range** (label-md "Price Range" + dual-handle slider):
   - Min ฿0 — Max ฿35,000
   - Range handles: primary color circles
   - Selected range displayed: "฿5,000 – ฿20,000"

2. **Stops** (label-md + 3 toggle chips horizontal):
   - "Non-stop" | "1 Stop" | "2+ Stops" (each rounded-full, border; selected: bg primary-container text on-primary-container)

3. **Departure time** (label-md + 4 time-range chips in 2×2 grid):
   - "00:00–06:00 Night" | "06:00–12:00 Morning" | "12:00–18:00 Afternoon" | "18:00–24:00 Evening"
   - Each chip shows sub-count: "3 flights"

4. **Duration** (label-md + single-handle max-duration slider):
   - "Up to 24 hours" | handle draggable | current value "Up to 12h"

5. **Airlines** (label-md + checkbox list):
   - Qoomlee (QQ) · 8 flights ☑
   - Thai Airways (TG) · 5 flights ☑
   - Jetstar (JQ) · 4 flights ☐
   - Singapore Airlines (SQ) · 6 flights ☑
   - Each row: airline code badge + name + count + checkbox (primary when checked)

6. **On-time performance** (label-md + single star-rating style slider):
   - "80%+ on-time" toggle chip

**"Show 23 Flights" button** (primary, full-width sticky bottom, h-56, rounded-xl, mx-16 mb-16)
- Count updates live as filters change

---

### SCREEN: passenger_info
**Context:** Step 2 of booking flow. Passenger details collection. Progress stepper shows step 2/4.

**Header:** Back arrow + "Passenger Details" (headline-md).

**Progress stepper** (4 steps, px-16, py-12):
- Step 1 "Flight" ✓ (filled circle, primary) → line → Step 2 "Passengers" (active, primary ring) → line → Step 3 "Requirements" (outline-variant) → line → Step 4 "Payment" (outline-variant)

**Passenger tabs** (if multiple passengers — horizontal scrollable chips below stepper):
- "Passenger 1" (active, primary-container bg) | "Passenger 2" | "Passenger 3"
- "+ Copy from P1" link when on tab 2+

**Flight summary card** (mx-16, surface-container, rounded-xl, p-16, border, mb-16):
- One-line: "BKK → SYD · QQ101 · Thu Oct 24 · 08:00–16:30 · Economy"
- "฿8,450 / person" right-aligned, primary

**Passenger form card** (mx-16, surface-container-lowest, rounded-xl, border, p-16, space-y-16):
- "Passenger 1 of 1 — Adult" header (label-md, on-surface-variant)

Fields (each with label-sm above, rounded-xl input, 48px height):
- **Title** (select chip row: Mr / Mrs / Ms / Dr — active chip has primary-container bg)
- **First name** — placeholder "As on passport"
- **Last name** — placeholder "As on passport"
- **Date of birth** — date picker trigger (calendar_today icon), shows "DD / MM / YYYY"
- **Nationality** — dropdown with search, flag emoji + country name
- **Passport / ID number** — mono-data font placeholder "A1234567"
- **Passport expiry** — date picker, shows warning if < 6 months beyond travel date (amber banner: "⚠ Passport expires too soon — must be valid 6+ months beyond Oct 24")
- **Country of residence** — dropdown

**Contact details section** (heading "Contact Details", mt-24):
- "Email address" — email keyboard, placeholder "Boarding pass & updates sent here"
- "Phone number" — row: country code selector (flag + "+66") | number input

**Emergency contact** (collapsible section, chevron toggle):
- Name, relationship, phone number fields

**Special requests** (tappable row, border, rounded-xl, p-16):
- "Special Requests" label + chevron_right → opens special_requests_modal
- Shows summary tags if any selected: "🥗 Vegetarian" "♿ Wheelchair"

**"Continue to Seat Selection" button** (primary, full-width, sticky bottom, h-56, rounded-xl, mx-16 mb-16)
- Disabled until all required fields valid
- On error: fields with error show red border + error message below

---

### SCREEN: special_requests_modal
**Context:** Bottom sheet modal from passenger_info. Allows dietary, mobility, and medical request selection.

**Header:** Drag handle + "Special Requests" (headline-md, px-16, mt-16).

**Sections:**

**Dietary Meals** (label-md, mb-8):
- Option rows (each: icon + label + checkbox, py-12, border-b outline-variant/20):
  - 🥗 Vegetarian | 🌱 Vegan | 🫐 Gluten-free | 🐄 Dairy-free | 🍗 Halal | ✡️ Kosher | 🧒 Child meal | 🏥 Diabetic meal
- Note below: "Meal requests are subject to availability. Must be requested ≥24 hours before departure."

**Mobility Assistance** (label-md, mt-24, mb-8):
- ♿ Wheelchair to gate (WCHR) | ♿ Wheelchair all the way (WCHC) | 🦯 Visually impaired assistance | 🦻 Hearing impaired assistance
- Each with info icon that expands a brief description

**Medical Needs** (label-md, mt-24, mb-8):
- 💊 Travelling with medication | 🧪 Medical oxygen required (requires prior approval) | 🤰 Pregnant (≥28 weeks requires medical certificate)
- Medical note text area (optional): placeholder "Any other medical information the crew should know"

**Additional Services** (label-md, mt-24, mb-8):
- 👶 Bassinet seat (infants only) | 🎸 Oversized musical instrument | 🚴 Sports equipment | 🐾 Pet in cabin (check availability)

**"Save Requests" button** (primary, full-width, h-56, rounded-xl, mx-16, mb-32)

---

### SCREEN: seat_selection
**Context:** Step 2b of booking flow (or step within check-in). Interactive seat map.

**Header:** Back arrow + "Select Your Seat" + "Skip" text link (primary, label-md) right-aligned.

**Progress stepper:** same as passenger_info, still on step 2.

**Flight info pill** (mx-16, my-8, surface-container, rounded-full, px-16 py-8, flex items-center gap-8):
- "QQ101 · BKK → SYD · Economy · 1 passenger remaining"

**Seat legend** (horizontal chips row, px-16, gap-8, overflow-x-auto, mb-8):
- 🟢 Available (surface-container-low, border outline-variant)
- 🔵 Selected (primary-container border-2 primary)
- ⚫ Occupied (surface-container-highest, text outline, cursor-not-allowed)
- 🟡 Extra legroom (tertiary-fixed/50, border tertiary)
- 🔴 Blocked (error-container/30, border error/20)

**Aircraft cabin view** (scrollable vertically, px-8):
- Aircraft nose illustration at top (simple icon)
- Row numbers on left (14px, on-surface-variant, text-right, w-20)
- Seat grid using 6-column layout (A B C | gap | D E F) with aisle gap visible

**Row groups:**
- Rows 1–4: "Business Class" section header (surface-container, full-width, rounded, label-sm secondary, py-4, text-center)
  - Seats are wider (2-2 config), larger cells (48px)
- Rows 5–8: "Premium Economy" header
  - Same 3-3 config, medium cells (44px)
- Rows 9–34: "Economy" header
  - Standard 3-3 config, cells 40px

**Each seat cell** (rounded-lg min-w-[36px] h-[36px] flex items-center justify-center label-sm):
- Available: surface-container-low, border outline-variant, hover:border-primary hover:bg-primary-fixed/20
- Selected: bg primary-container, border-2 primary, text on-primary-container, scale-105 shadow
- Occupied: bg surface-container-highest, text outline, cursor-not-allowed
- Exit row: icon exit_to_app (12px, on-surface-variant) above row number
- Extra legroom: top border tertiary 2px

**Seat detail popup** (appears above selected seat, surface-container-lowest, rounded-xl, border, p-12, shadow-lg, z-50):
- "Seat 14A" (headline-md) + "Window · Economy"
- Features chips: "Extra legroom" (tertiary-fixed), "Exit row" (warning)
- Price: "Free" or "฿350 upgrade"
- "Select this seat" button (primary, rounded-xl, full-width, h-40)

**Summary sticky bar** (bottom, above nav, surface-container-lowest, border-t, p-16):
- "Selected: 14A · Window · Economy — Free"
- "Confirm Seat" button (primary, h-48, rounded-xl)

---

### SCREEN: travel_requirements
**Context:** Step 3 of booking flow. Verifying international travel requirements.

**Header:** Back arrow + "Travel Requirements" (headline-md).
**Progress stepper:** Step 3 active.

**Section header card** (mx-16, secondary bg, rounded-xl, p-16, text white):
- "Bangkok → Sydney" route + passport icon
- "Please verify all requirements before continuing to payment"

**Requirements checklist** (mx-16, mt-16, space-y-12):

Each requirement row (surface-container-lowest, rounded-xl, border, p-16, flex gap-16 items-start):
- Left: status icon circle (40×40):
  - ✅ check_circle (success green, filled) — requirement met
  - ⚠️ warning (amber) — action needed
  - ❌ cancel (error) — not eligible / missing
- Center: requirement title (label-md) + description (label-sm, on-surface-variant)
- Right: chevron_right if actionable

Requirements to show:
1. ✅ **Passport validity** — "Valid until Mar 2027 · Meets 6-month rule" | tapping → info sheet
2. ⚠️ **Australian ETA (eVisitor)** — "Required for Thai passport holders · Apply online before departure" | "Apply Now →" link (primary, label-md)
3. ✅ **Health requirements** — "No vaccination required for AU entry"
4. ✅ **Customs declaration** — "AUD 900 duty-free limit · Declare restricted items"
5. ⚠️ **Travel insurance** — "Recommended but not mandatory" | "View Options →"

**Document upload section** (mx-16, mt-24, surface-container, rounded-xl, p-16, border):
- "Upload Supporting Documents" (label-md) + optional label
- Upload zones (dashed border, rounded-xl, p-16, flex-col items-center):
  - upload_file icon + "Visa / ETA screenshot" + "JPG, PNG, PDF · Max 5MB" (label-sm)
  - + "Add another document" row

**Confirmation checkbox** (mx-16, mt-24, flex gap-12 items-start):
- Checkbox (primary when checked, 20×20, rounded-sm) + "I confirm all travel requirements are met and I take responsibility for any issues at immigration"
- label-sm, on-surface-variant

**"Continue to Payment" button** (primary, full-width, mx-16, h-56, rounded-xl, mb-16):
- Disabled (greyed, cursor-not-allowed) until checkbox checked
- When ETA not done: tooltip on button "Please complete visa requirements before continuing"

---

### SCREEN: visa_checker
**Context:** Sub-page from travel_requirements when tapping "Visa requirements".

**Header:** Back arrow + "Visa Requirements" (headline-md).

**Nationality selector** (mx-16, mt-16, surface-container-lowest, rounded-xl, border, p-16):
- "Your nationality" label (label-sm) + flag emoji + country dropdown
- "Destination country" label + flag + country (pre-filled from booking, e.g., 🇦🇺 Australia)

**Result card** (mx-16, mt-16, rounded-xl, border-2 border-warning, p-16, bg warning/5):
- Status badge: ⚠️ "Visa Required" (warning amber, rounded-full, label-md)
- "Thai passport holders require an ETA (Electronic Travel Authority) to enter Australia"

**Requirements list** (mt-16, space-y-12):
- "ETA subclass 601" — Online application | AUD 20 fee | Usually instant approval
- Processing time: "1 business day (apply at least 72h before)"
- Validity: "12 months, multiple entry, up to 3 months per stay"
- Application: "Apply via Australian Government ImmiAccount"

**"Apply for ETA" CTA** (tertiary-fixed bg, on-tertiary-fixed text, rounded-xl, full-width, h-56):
- Opens external browser (note: this is an external link)

**Country grid** (other popular destinations, "Also check requirements for"):
- 4 flag chips: 🇳🇿 🇯🇵 🇬🇧 🇸🇬

---

### SCREEN: vaccination_upload
**Context:** Sub-page for uploading health / vaccination documents.

**Header:** Back arrow + "Health Documents" (headline-md).

**Required documents section** (mx-16, mt-16):
- Heading "Required for your route" (label-md, on-surface-variant)
- No mandatory vaccination for BKK→SYD — green banner: "✅ No vaccination required for this route"

**Recommended uploads** (mx-16, mt-16):
- "Optional: Upload to keep your health records on file"

**Upload cards** (space-y-12):
Each card (surface-container-lowest, rounded-xl, border, p-16):
- vaccine icon + "COVID-19 Vaccination Certificate"
- Status: upload_file icon + "Tap to upload · JPG, PNG, PDF · Max 5MB"
- Or: shows uploaded file name with checkmark and "Remove" link

**"Continue" button** (primary, full-width, mx-16, h-56, rounded-xl, bottom sticky)

---

### SCREEN: travel_insurance
**Context:** Travel insurance upsell sub-page.

**Header:** Back arrow + "Travel Insurance" (headline-md).

**Hero strip** (secondary bg, mx-0, p-16 px-container-margin-mobile, text white):
- "Protect your trip" (headline-lg-mobile) + "From ฿290 per person" (body-md, white/80)
- shield icon (80px, white/20, right side)

**Plan cards** (mx-16, mt-16, space-y-12):

1. **Basic Plan** (surface-container-lowest, rounded-xl, border, p-16):
   - "Basic" badge (secondary-container, rounded-full, label-sm) + "฿290/person"
   - Coverage list (label-sm, on-surface-variant, space-y-4):
     - check Medical emergency up to USD 50,000
     - check Trip cancellation up to ฿15,000
     - check Baggage loss up to ฿5,000
     - close Missed connection ✗
     - close Adventure sports ✗
   - "Add to booking" button (outlined, full-width, rounded-xl, h-40, label-md)

2. **Comprehensive Plan** (surface-container-lowest, rounded-xl, border-2 border-primary, p-16, relative):
   - "Recommended" pill (primary-container bg, absolute top-right, label-sm) + "฿590/person"
   - All Basic items + Missed connection + Medical evacuation + 24/7 support
   - "Add to booking" button (primary, full-width, rounded-xl, h-40)

3. **Premium Plan** (tertiary-fixed/30 bg, border tertiary, rounded-xl, p-16):
   - "Premium" badge (tertiary-container) + "฿990/person"
   - All Comprehensive + adventure sports + pre-existing conditions
   - "Add to booking" button (tertiary-container bg, on-tertiary-container text)

**"Continue without insurance"** text link (primary, label-md, centered, mt-16) with "You can add insurance later from Manage Booking"

---

### SCREEN: payment
**Context:** Step 4 of booking flow. Final payment screen.

**Header:** Back arrow + "Secure Payment" (headline-md) + lock icon (outline-variant, 20px) right.
**Progress stepper:** Step 4 active (last step).

**Order summary card** (mx-16, surface-container, rounded-xl, border, p-16):
- "Booking Summary" (label-md, on-surface-variant)
- Flight row: "QQ101 · BKK → SYD · Thu Oct 24 · 1 Adult" (label-md)
- Price rows (space-y-4):
  - "Base fare · 1 Adult": ฿7,200
  - "Taxes & fees": ฿1,250
  - "Seat 14A": Free
  - "Travel insurance": ฿590 (or "Not added")
  - Divider (dashed, outline-variant)
  - **"Total"**: ฿9,040 — headline-md, primary
- "Price guaranteed for 14:32" countdown timer (label-sm, on-surface-variant, mono-data)

**Promo code row** (mx-16, flex gap-8):
- Input field "Promo code" (flex-1, rounded-xl, border) + "Apply" button (outlined, rounded-xl, px-16, label-md)
- Success: green banner "✅ QOOMFIRST applied — ฿500 off!"

**Payment method selector** (mx-16, mt-16):
- Tab row (surface-container-low, p-1, rounded-lg, flex):
  - "Card" (active: primary-container bg) | "PromptPay" | "Bank Transfer" | "Other"

**Card payment form** (surface-container-lowest, rounded-xl, border, p-16, mx-16, mt-12):
- "Cardholder name" input
- "Card number" input (credit_card icon, mono-data font placeholder "•••• •••• •••• ••••", real-time brand logo detection: Visa / Mastercard)
- Row: "Expiry MM/YY" (half-width) + "CVV" (half-width, + help icon that opens tooltip "3 digits on back")
- "Save card for future payments" checkbox (unchecked by default, label-sm)
- Card brand logos: Visa, Mastercard, JCB, UnionPay (small greyscale logos row)

**PromptPay form** (shown when PromptPay tab active):
- QR code placeholder (large square, centered, surface-container bg, dashed border, 200×200)
- "QR code will be generated after confirmation" note
- "Expires in 10 minutes once generated" (label-sm, on-surface-variant)

**Billing address** (collapsible section, "Same as profile" toggle ON by default):
- When toggled OFF: shows address fields (address line 1, city, country)

**Terms row** (mx-16, mt-16, flex gap-12 items-start):
- Checkbox + "I agree to Qoomlee's Terms of Service and Fare Rules"
- "View terms" link (primary)

**Cancellation policy banner** (mx-16, surface-container-low, rounded-xl, p-16, border, flex gap-12):
- info icon + "Partially refundable: Cancel > 24h before departure for 80% refund. No refund for same-day cancellation."

**"Pay ฿9,040 Securely" button** (primary, full-width, mx-16, h-56, rounded-xl, mt-16 mb-16):
- lock icon left + "256-bit SSL Encryption" note (label-sm, on-surface-variant, centered below button)
- Loading state: spinner + "Processing payment…"
- Disabled until card fields valid + terms checkbox

---

### SCREEN: payment_3ds
**Context:** 3D Secure authentication step after tapping Pay.

**Header:** Close (X) + "Secure Verification" (headline-md). No bottom nav.

**Center content** (flex-col items-center, pt-48):
- lock icon in primary-container circle (80×80)
- "Verify Your Identity" (headline-lg-mobile)
- "Your bank requires verification for this transaction" (body-md, on-surface-variant, text-center, mx-32)

**OTP entry card** (mx-16, mt-32, surface-container-lowest, rounded-xl, border, p-24):
- "An SMS was sent to +66 8x xxx xx89" (label-sm, on-surface-variant)
- 6-digit OTP input (6 individual boxes, 48×48 each, mono-data, auto-advance on input)
- "Resend code" link (primary, label-md, centered) + countdown "Resend in 0:42"
- Error state: all boxes red border + "Invalid code. 2 attempts remaining."

**Biometric option** (if device supports, mt-24):
- fingerprint icon + "Use biometric instead" (primary, label-md)

**"Verify Payment" button** (primary, full-width, h-56, rounded-xl, mx-16)

---

### SCREEN: booking_confirmation
**Context:** Payment success screen. End of booking flow.

**Header:** No back arrow. "Qoomlee" logo centered. Share icon right.

**Success animation area** (hero-gradient bg, flex-col items-center, py-48):
- Large check_circle icon (80px, white, FILL=1) with subtle bounce animation
- "Booking Confirmed!" (headline-lg-mobile, white)
- "Your adventure begins here" (body-md, white/80)

**PNR card** (mx-16, -mt-24 z-20 relative, surface-container-lowest, rounded-xl, border, p-24, shadow-lg, text-center):
- "Booking Reference" (label-sm, on-surface-variant)
- PNR code "QM92Z4" (headline-lg, primary, mono-data, letter-spacing 0.15em)
- copy_all icon button next to PNR (tap to copy → "Copied!" snackbar)
- "QQ101 · BKK → SYD · Thu, 24 Oct 2024 · 08:00" (label-md)

**Timeline card** (mx-16, mt-16, surface-container-lowest, rounded-xl, border, p-16):
- Vertical timeline: Departure (flight_takeoff) → Arrival (flight_land)
- Bangkok Suvarnabhumi · 08:00 → Sydney Kingsford Smith · 16:30
- "Direct flight · 8h 30m" in center

**Passenger summary** (mx-16, mt-16, surface-container, rounded-xl, p-16, border):
- "Jonathan Doe · Seat 14A · Economy" with person icon

**Checklist action row** (mx-16, mt-16, space-y-8):
- Row (surface-container-lowest, rounded-xl, border, p-12, flex justify-between items-center) for each:
  - "Add to Calendar" (calendar_add_on icon, primary) → chevron_right
  - "Download Itinerary PDF" (download icon) → chevron_right
  - "View Full Booking Details" (receipt icon) → opens booking_details screen

**Email/SMS confirm strip** (mx-16, mt-16, surface-container, rounded-xl, p-16):
- "Confirmation sent to john@email.com" (label-sm, on-surface-variant)
- "Resend" link (primary)

**Action buttons** (mx-16, mt-24, space-y-12):
- "Go to Online Check-in" (primary, full-width, h-56, rounded-xl) — note: opens 24h before
- "Back to Home" (outlined, full-width, h-48, rounded-xl)

**Bottom nav:** Bookings tab active.

---

### SCREEN: booking_details
**Context:** Full booking detail view opened from booking_confirmation or manage_booking.

**Header:** Back arrow + "Booking Details" (headline-md) + share icon right.

**Status banner** (mx-16, mt-16, success green bg/10, border border-success/20, rounded-xl, p-16, flex gap-12):
- check_circle (success green) + "Booking Confirmed · Paid ฿9,040"

**All sections** (mx-16, space-y-16):

1. **Flight segment card** (surface-container-lowest, rounded-xl, border, p-16):
   - Full route timeline (same as flight_detail)
   - Aircraft, terminal, gate (TBC) info

2. **Passengers card**:
   - Each passenger row: name, seat, class, passport last 4 digits
   - Special requests chips if any

3. **Seat assignments card**:
   - Mini seat map preview with selected seats highlighted
   - "14A – Window – Economy"

4. **Payment card**:
   - Full price breakdown
   - "Visa ending 4532 · ฿9,040 · Paid 20 May 2026"
   - "Download receipt" link

5. **Cancellation policy card**:
   - Text of policy
   - "Cancel booking" destructive text link (error color)

6. **Travel requirements status card**:
   - Each requirement with ✅ or ⚠️

---

### SCREEN: travel_prep_checklist
**Context:** Pre-flight preparation checklist. Opened from booking_confirmation or manage_booking.

**Header:** Back arrow + "Pre-flight Checklist" (headline-md).

**Departure countdown banner** (mx-16, mt-16, secondary bg, rounded-xl, p-16, text white):
- "8 days until departure" (headline-md)
- "Thu, 24 Oct 2024 · 08:00 · BKK"

**Checklist sections** (mx-16, mt-16, space-y-12):

**Documents** section:
- ☑ Passport checked + expiry > 6 months (auto-checked if verified)
- ☐ Australian ETA applied (manual checkbox)
- ☐ Travel insurance purchased (auto if bought)
- ☐ Flight itinerary downloaded

**Before airport** section:
- ☐ Online check-in completed (opens 24h before — locked with lock icon until eligible)
- ☐ Boarding pass saved to wallet
- ☐ Baggage within limits (23kg checked, 7kg carry-on)
- ☐ Dangerous goods removed from bags

**At airport** section (informational, not checkboxes):
- info "Arrive 3 hours before international departure"
- info "Security checkpoint allows 100ml liquids in 1L clear bag"
- info "Gate closes 60 minutes before departure"

**Reminders row** (surface-container, rounded-xl, p-16, mx-16, mt-24, flex justify-between):
- "Set check-in reminder" (24h before) → toggle switch (primary)
- "Set airport arrival reminder" (3h before) → toggle switch

**"Back to Booking" button** (outlined, full-width, mx-16, h-48, rounded-xl, mt-24)

---

# ═══════════════════════════════════════════
# CHECK-IN FLOW
# ═══════════════════════════════════════════

---

### SCREEN: online_check_in
**Context:** Entry point to check-in flow. Bottom nav Check-in tab active.

**Header:** Standard header (hamburger + Qoomlee logo + avatar).

**Hero banner** (hero-gradient, px-16, pt-32 pb-48):
- h1 "Online Check-in" (headline-lg-mobile, white)
- "Save time at the airport — check in from anywhere" (body-md, white/80)
- how_to_reg icon (100px, white/20) bottom-right decorative

**Check-in timing info card** (mx-16, -mt-24 z-20 relative, surface-container-lowest, rounded-xl, border, p-16, shadow-sm):
- Row: schedule icon (primary) + "Check-in opens 24 hours before departure"
- Row: timer_off icon (on-surface-variant) + "Check-in closes 90 min before domestic, 120 min before international"
- Row: how_to_reg icon + "Gate closes 60 min before international departure"

**Retrieval form card** (mx-16, mt-16, surface-container-lowest, rounded-xl, border, p-16):
- "Find your booking" (label-md, on-surface-variant, mb-12)
- "Last name" input (person icon, required)
- "Booking reference (PNR)" input (mono-data font, placeholder "e.g. QM92Z4", max 6 chars, uppercase)
- Divider row with "or" text
- "Email address" input (email icon, placeholder "Booking email address")
- "Retrieve Booking" button (primary, full-width, h-56, rounded-xl, mt-8)

**Recent bookings** (mx-16, mt-24, label "Recent Bookings" in label-md):
- Horizontal scroll row of booking cards (each: surface-container, rounded-xl, p-12, min-w-[200px]):
  - "QM92Z4 · QQ101" (mono-data, primary) + "BKK→SYD · Oct 24"
  - Status chip: "Check-in opens in 6 days" (label-sm, on-surface-variant)
- Or: "No recent bookings" empty state (illustration + text)

**Flight status link** (mx-16, mt-16, surface-container-low, rounded-xl, p-16, flex justify-between items-center):
- "Check real-time flight status" + chevron_right → flight_status screen

**Bottom nav:** Check-in tab active.

---

### SCREEN: checkin_eligibility
**Context:** Result of PNR retrieval. Shows whether check-in is available.

**Header:** Back arrow + "Check-in Status" (headline-md).

**Status card** (mx-16, mt-16, rounded-xl, border-2, p-24, text-center):

Variant A — ✅ Eligible:
- check_circle (80px, success green, FILL=1)
- "Check-in Available" (headline-lg-mobile, on-surface)
- "QQ101 · BKK → SYD · Thu, 24 Oct · 08:00" (label-md, on-surface-variant)
- "9 hours 32 minutes remaining" (mono-data, on-surface-variant)
- "Continue to Check-in →" button (primary, full-width, h-56)

Variant B — ⏱ Too early:
- schedule (80px, outline)
- "Check-in Not Available Yet"
- "Opens in 5 days, 6 hours"
- Countdown timer component (DD:HH:MM:SS, mono-data, headline-lg-mobile)
- "Set Reminder" button (outlined) + email notification option

Variant C — ❌ Closed:
- cancel (80px, error)
- "Check-in Closed"
- "Online check-in closed 2 hours before departure. Please proceed to the airport check-in counter."
- "Contact Support" button (outlined)

Variant D — ❌ Invalid:
- error (80px, error)
- "Booking Not Found"
- "Check your last name and PNR. Contact support if the issue persists."
- "Try Again" + "Contact Support"

---

### SCREEN: select_passengers
**Context:** Step 1 of check-in flow after PNR retrieved. Select who is checking in.

**Header:** Back arrow + "Select Passengers" (headline-md).

**Check-in progress stepper** (3 steps: Passengers → Details → Done):
- Step 1 "Passengers" active.

**Flight info banner** (mx-16, mt-16, secondary bg, rounded-xl, p-16, text white):
- "QQ101 · BKK → SYD" (headline-md) + "Thu, 24 Oct 2024 · 08:00" + "9h 32m remaining"

**Passenger list** (mx-16, mt-16, space-y-12):
Each passenger card (surface-container-lowest, rounded-xl, border, p-16, flex gap-16 items-center):
- Large checkbox (primary, 24×24, rounded-md, left side)
- Center: name (label-md) + "Adult" tag / "Child" / "Infant" (label-sm chip)
- Right: eligibility status:
  - ✅ "Eligible" (success chip, label-sm)
  - ⚠️ "Action required" (warning chip) + info on tap
  - ❌ "Not eligible" (error chip) + reason on tap

**"Select All" shortcut** (mx-16, flex justify-between, label-md):
- "Select all eligible passengers" checkbox row

**Ineligible note** (if any): amber banner "1 passenger requires additional verification at the airport counter" with info icon.

**"Check-in Selected (2)" button** (primary, full-width, h-56, rounded-xl, mx-16, sticky bottom):
- Count updates as passengers checked/unchecked

---

### SCREEN: check_in_details
**Context:** Step 2 of check-in. Individual passenger check-in form. Tabbed for each passenger.

**Header:** Back arrow + "Check-in Details" (headline-md).
**Progress stepper:** Step 2 active.

**Passenger tab row** (horizontal, scrollable, surface-container-low, mx-0, px-16, py-8):
- "Jonathan D." (active, primary-container) | "Sarah D." (on-surface-variant)
- Progress indicator on each tab: ✓ complete or "3/5 steps" counter

**Step tabs** (vertical progress list on left, or horizontal tabs depending on content height):
Tabs: Personal | Baggage | Seat | Declaration | Services

**Personal Details tab** (mx-16, mt-16, space-y-16):
- Pre-filled card (surface-container, rounded-xl, p-16):
  - Name: Jonathan Doe (read-only, label-md + label-sm note "As on passport")
  - Passport: ••••5643 (masked, tap to reveal) + expiry Mar 2027 ✅
- Editable fields:
  - "Mobile number for flight updates" (pre-filled, editable)
  - "Email for boarding pass" (pre-filled, editable)
- Emergency contact (collapsible): Name + relationship + phone

**Baggage Declaration tab** (mx-16, mt-16):
- Checked bags stepper: "How many bags are you checking? 0 / 1 / 2 / 3+" (chip selector row)
- Per bag: weight estimate field (0–23kg slider)
- Carry-on confirmation: "I confirm my carry-on is ≤7kg and ≤56×45×25cm" checkbox
- Oversize/special items toggle + form (musical instruments, sports, mobility equipment)
- Baggage fee estimate: "1 bag checked · Included in fare" or "2nd bag: ฿850 — Add to booking" warning card

**Seat tab** → redirects to seat_selection screen (check-in variant)

**Dangerous Goods Declaration tab** (mx-16, mt-16):
- Warning banner (error-container bg, border error, p-16, rounded-xl):
  - "This is a legal declaration. False declarations may result in prosecution."
- "I declare that my baggage does NOT contain any of the following:" (label-md)
- Prohibited items list (expandable, 12 categories with icons):
  - 💣 Explosives / ammunition | 🔥 Flammable liquids & gases | ☢️ Radioactive material
  - 🔋 Spare lithium batteries > 100Wh | 🔪 Sharp weapons (in checked bags) | 🧴 > 100ml liquids (carry-on)
  - "View complete list" link
- Large mandatory checkbox (primary, 24×24): "I AGREE to the dangerous goods declaration" (label-md, on-surface)
- Cannot proceed unless checked

**Special Services tab** (mx-16, mt-16):
- Meal selection (chips, scrollable row): Standard / Vegetarian / Vegan / Halal / Kosher / Child / Diabetic
- Assistance (checkbox rows): Wheelchair (WCHR) / Visually impaired / Hearing impaired
- Extras (toggle rows): Priority boarding / Lounge access (fee applies) / Fast-track security

**"Save & Continue" button** (primary, full-width, h-56, rounded-xl, mx-16, sticky bottom)
- Per tab, validates required fields before allowing proceed

---

### SCREEN: review_check_in
**Context:** Final review before confirming check-in.

**Header:** Back arrow + "Review Check-in" (headline-md).
**Progress stepper:** Step 3 (final) active.

**Section cards** (mx-16, space-y-16):

1. **Passengers** (surface-container-lowest, rounded-xl, border, p-16):
   - "2 Passengers" header + edit icon (top-right, link to select_passengers)
   - Each: ✓ Jonathan Doe · Seat 14A | ✓ Sarah Doe · Seat 14B

2. **Seats** (surface-container-lowest, rounded-xl, border, p-16):
   - Mini seat map preview (schematic, 4-row snippet centered on selected seats)
   - Seat chips highlighted in primary-container

3. **Baggage** (surface-container-lowest, rounded-xl, border, p-16):
   - Jonathan: "1 checked bag · 20kg estimated · Included"
   - Sarah: "1 checked bag · 20kg estimated · Included"

4. **Special services** (surface-container-lowest, rounded-xl, border, p-16):
   - Meal: "Standard" / "Vegetarian for Sarah"
   - Assistance: "None"

5. **Declaration** (surface-container-lowest, rounded-xl, border-2 border-error/20, p-16):
   - ✓ check_circle (success) "Dangerous goods declaration signed by Jonathan"
   - ✓ "Dangerous goods declaration signed by Sarah"

**Important reminders** (mx-16, surface-container, rounded-xl, p-16, border):
- "Arrive at BKK Suvarnabhumi by 05:00 (3h before departure)"
- "Gate: To be confirmed · Terminal 1"
- "Boarding begins at 07:10 (50 min before)"

**"Complete Check-in" button** (primary, full-width, h-56, rounded-xl, mx-16, mb-16):
- Loading state: spinner + "Processing…"
- On success → navigates to boarding_pass

**"Make Changes" link** (label-md, primary, centered below button)

---

### SCREEN: boarding_pass
**Context:** Final boarding pass. Shown after check-in or from Passes tab.

**Header:** Close icon (×) or back arrow + "Qoomlee" logo centered + share icon right. No bottom nav (full-screen pass experience).

**Passenger tab selector** (if multiple, horizontal pills below header):
- "Jonathan D." (active) | "Sarah D."

**Boarding pass card** (mx-16, surface-container-lowest, rounded-xl, shadow-lg, border, overflow-hidden):

**Card header** (secondary bg, p-16, flex justify-between items-center):
- Left: flight_takeoff icon (FILL=1, white) + "Qoomlee Airline" (label-md, white)
- Right: "QQ101" badge (tertiary-fixed bg, on-tertiary-fixed text, rounded-sm, mono-data)

**Route block** (p-16, space-y-12):
- Flex row: "BANGKOK" (label-sm, on-surface-variant) + "BKK" (headline-lg-mobile, primary) | flight icon line 1h15m | "CHIANG MAI" + "CNX"
- Grid 2×2: Date "12 OCT 2024" | Departure "14:20" | Boarding "13:45" | Terminal "T1"

**Perforation tear line** (px-16, relative):
- Left notch circle (w-24 h-24, surface-bright, border-r, absolute -left-12)
- Dashed border-t across full width
- Right notch circle (absolute -right-12)

**Passenger block** (p-16, surface-container-low/50 bg, space-y-16):
- Grid: "PASSENGER" (label-sm) + "JONATHAN DOE" (label-md, uppercase) | "BOOKING REF" + "QM92Z4" (mono-data, primary)
- Grid: Gate "F12" (headline-md, primary, bg primary/5 rounded-lg p-8) | Boarding time "13:45" | Seat "12A" (tertiary) | Class "ECONOMY"

**QR Code area** (flex-col items-center, p-16):
- Gold gradient border (4px padding, background: linear-gradient(135deg, #0057a2, #ffddb2), border-radius 12px)
- White inner box (rounded-lg p-8)
- QR code image (160×160, high contrast)
- Barcode number below (mono-data, label-sm, on-surface-variant)

**Secondary info cards** (mx-16, mt-16, space-y-12):
- Baggage card: luggage icon + "1 Checked (20kg) · 1 Carry-on (7kg) · Claim Belt 04"
- Notice card: info icon (error color) + "Gate closes 20 min before departure. Present passport at gate."

**Action buttons** (mx-16, mt-24):
- "Add to Apple Wallet" (on-surface bg, surface text, full-width, h-56, rounded-xl, wallet icon)
- 2-column row: "Save PDF" (download icon, outlined) | "Print" (print icon, outlined)

---

### SCREEN: boarding_pass_multiple
**Context:** Multiple boarding passes view — all passengers in one scrollable view.

**Header:** Back arrow + "All Boarding Passes" (headline-md) + share icon.

**Download all button** (outlined, mx-16, h-48, rounded-xl, mt-16): "Download All as PDF (2 passes)"

**Boarding pass stack** (mx-16, mt-16, space-y-24):
- Compact pass card for each passenger (same design as boarding_pass but condensed to 75% height)
- Tap to expand to full pass view

---

# ═══════════════════════════════════════════
# MANAGE BOOKING
# ═══════════════════════════════════════════

---

### SCREEN: manage_booking
**Context:** Booking management hub. Accessible from Bookings nav tab.

**Header:** Standard + "My Bookings" title (headline-md).

**Active bookings section** (mx-16, mt-16):
- "Upcoming" (label-md) + booking count badge (primary-container, rounded-full)

**Booking card** (surface-container-lowest, rounded-xl, border, p-16, shadow-sm):
- Status badge (success green, FILL=1, label-sm): "✓ Confirmed"
- PNR: "QM92Z4" (mono-data, primary, label-md)
- Route timeline: BKK → SYD (same compact style)
- Passenger count + seat + class chips
- Payment: "฿9,040 · Paid" (label-sm, success)
- Check-in status: "Check-in opens in 6 days" (label-sm, warning) or "✓ Checked in" (success)

**Action row** (flex gap-8, mt-12, overflow-x-auto):
- "Check-in" chip (primary-container, rounded-full, label-md, enabled/disabled logic)
- "View Pass" chip (outlined)
- "Manage" chip (outlined, opens manage options)
- "Change" chip (outlined, → change_flight)

**Past bookings section** (mt-24):
- "Past" header (label-md, on-surface-variant)
- Past booking cards (greyed, surface-container bg): same structure but with "Completed" status chip

**Empty state** (if no bookings):
- confirmation_number icon (80px, outline-variant)
- "No bookings yet"
- "Start searching for your next flight" button (primary)

**Bottom nav:** Bookings tab active.

---

### SCREEN: change_flight
**Context:** Flight change flow. Opens from manage_booking action.

**Header:** Back arrow + "Change Flight" (headline-md).

**Current flight card** (mx-16, mt-16, surface-container, rounded-xl, border, p-16):
- "Current flight" label (label-sm, on-surface-variant)
- "QQ101 · BKK → SYD · Thu, 24 Oct · 08:00" (label-md)
- Change fee notice: "Change fee: ฿850 per passenger" (warning banner below, amber)

**Alternative flights** (mx-16, mt-16):
- "Available alternatives" heading (label-md)
- Same flight card design as flight_results but with "Price difference" column:
  - "QQ103 · 14:00 · +฿200" or "QQ105 · 18:00 · -฿150 credit"
  - Cheaper options show "Save ฿150" chip (success green)
  - More expensive show "Additional ฿200" chip (warning)

**Summary before confirm** (mx-16, mt-16, surface-container-lowest, rounded-xl, border, p-16):
- Change fee: ฿850
- Fare difference: +฿200
- Total to pay: ฿1,050

**"Confirm Change" button** (primary, full-width, h-56, rounded-xl, mx-16 mb-16)
**"Cancel" link** (label-md, primary, centered)

---

### SCREEN: refund_request
**Context:** Refund/cancellation request. Opens from manage_booking.

**Header:** Back arrow + "Request Refund" (headline-md).

**Warning banner** (mx-16, mt-16, error-container bg, border error/20, rounded-xl, p-16):
- warning icon + "This action cannot be undone. Your booking will be cancelled."

**Cancellation policy** (mx-16, mt-16, surface-container, rounded-xl, p-16, border):
- "> 24 hours before: 80% refund (฿7,232)"
- "< 24 hours: No refund"
- "No-show: No refund"
- "Current refund amount: ฿7,232" (highlighted, success green)

**Reason selection** (mx-16, mt-16):
- "Reason for cancellation" (label-md)
- Radio card options (each: surface-container-lowest, rounded-xl, border, p-16, flex gap-12):
  - Flight plans changed | Medical emergency | Visa denied | Duplicate booking | Other
  - Active: border-2 primary, bg primary-fixed/5

**"Other" text area** (shown when Other selected, mx-16, mt-12, rounded-xl, border, p-12, h-100)

**Supporting documents** (mx-16, mt-16, for medical/visa reason):
- Upload zone: dashed border, upload_file icon + "Attach document"

**Refund method** (mx-16, mt-16, surface-container, rounded-xl, p-16):
- "Refund to original payment method: Visa ending 4532"
- Estimated processing: "5–7 business days"

**"Cancel Booking & Request ฿7,232 Refund" button** (error bg on-error text, full-width, h-56, rounded-xl, mx-16 mb-16)
**"Keep my booking" outlined button** (below, secondary)

---

### SCREEN: additional_services
**Context:** Add-on services purchase page from manage_booking.

**Header:** Back arrow + "Add Services" (headline-md).

**Booking header** (mx-16, mt-16, surface-container, rounded-xl, p-16, border):
- "QM92Z4 · QQ101 · BKK → SYD · 24 Oct"

**Services sections** (mx-16, mt-16, space-y-16):

1. **Extra Baggage** (surface-container-lowest, rounded-xl, border, p-16):
   - "Your current allowance: 1 checked bag (20kg)"
   - Stepper to add bags: +฿850/bag (up to 3 extra)
   - Weight upgrade: +฿450 for 23→32kg limit

2. **Seat Upgrade** (surface-container-lowest, rounded-xl, border, p-16):
   - Current: "Economy · Seat 14A"
   - "Upgrade to Premium Economy from ฿3,200" (chip, outlined primary)
   - "Upgrade to Business from ฿12,500" (chip, tertiary-fixed bg)
   - Mini seat map with available upgrades highlighted

3. **Lounge Access** (tertiary-fixed/20 bg, rounded-xl, border tertiary, p-16):
   - spa icon + "Airport Lounge · BKK International Lounge"
   - "฿990 per person · Includes meals, WiFi, showers"
   - Toggle switch to add/remove

4. **Travel Insurance** → links to travel_insurance screen

5. **Priority Boarding** (surface-container-lowest, rounded-xl, border, p-16):
   - "Board before Economy passengers · ฿350/person"
   - Toggle switch

**Cart summary** (sticky bottom bar, surface-container-lowest, border-t, p-16):
- "Added: Extra bag + Priority boarding = ฿1,200"
- "Confirm & Pay ฿1,200" button (primary, h-48, rounded-xl, flex-1)

---

# ═══════════════════════════════════════════
# AUTHENTICATION FLOW
# ═══════════════════════════════════════════

---

### SCREEN: login
**Context:** App entry / sign-in screen.

**Header:** "Qoomlee" logo centered (no hamburger, no avatar). No bottom nav.

**Hero** (hero-gradient bg, py-64, flex-col items-center):
- flight icon (64px, white, FILL=1)
- "Welcome back" (headline-lg-mobile, white)
- "Sign in to manage your bookings" (body-md, white/80)

**Form card** (mx-16, -mt-24 z-20 relative, surface-container-lowest, rounded-xl, border, p-24, shadow-lg):
- "Email address" input (email icon, email keyboard)
- "Password" input (lock icon, password type, eye toggle to show/hide)
- "Forgot password?" link (primary, label-md, right-aligned below password field)
- "Sign In" button (primary, full-width, h-56, rounded-xl, mt-16)
- Divider: "or continue with" (on-surface-variant, label-sm, horizontal lines)
- "Continue as Guest" button (outlined, full-width, h-48, rounded-xl)

**Sign up link** (centered below card, mt-16):
- "Don't have an account? " + "Sign up" (primary, label-md)

**Error state** (red border on fields, error banner below button): "Invalid email or password. 2 attempts remaining."

---

### SCREEN: register
**Context:** New account registration.

**Header:** Back arrow + "Create Account" (headline-md). No bottom nav.

**Progress stepper** (2 steps: Account Details → Verify Email):
- Step 1 active.

**Form** (mx-16, mt-16, space-y-16):
- "First name" + "Last name" (2-column row)
- "Email address" (full-width)
- "Password" (with strength indicator bar below: Weak/Fair/Strong/Very Strong in color segments)
  - Requirements chips: "8+ chars" ✓ / "Uppercase" ✓ / "Number" ✓ / "Special char" ✗
- "Confirm password" (shows ✓ when matches)
- "Date of birth" (date picker, for age verification)
- "I agree to Terms of Service and Privacy Policy" checkbox + links (primary)
- "Create Account" button (primary, full-width, h-56, rounded-xl)

**Social/Login redirects** (centered below button):
- "Already have an account? Sign in" (primary link)

---

### SCREEN: forgot_password
**Context:** Password reset flow.

**Header:** Back arrow + "Reset Password" (headline-md).

**Step 1 — Enter email** (mx-16, mt-48, surface-container-lowest, rounded-xl, border, p-24):
- key icon (64px, primary, centered, mb-16)
- "Enter your account email" (headline-md, centered)
- "A reset link will be sent to your email" (body-md, on-surface-variant, centered, mb-24)
- "Email address" input
- "Send Reset Link" button (primary, full-width, h-56, rounded-xl)

**Step 2 — Check email** (after button tap):
- mark_email_read icon (64px, success green)
- "Check your inbox" (headline-md)
- "Reset link sent to john@email.com" (body-md, on-surface-variant)
- "Resend in 0:55" countdown + "Resend" link
- "Back to Sign In" (outlined, full-width, h-48, rounded-xl, mt-24)

---

# ═══════════════════════════════════════════
# UTILITY SCREENS
# ═══════════════════════════════════════════

---

### SCREEN: flight_status
**Context:** Real-time flight status lookup. Accessible from Check-in tab or bottom nav.

**Header:** Standard header + "Flight Status" title (headline-md).

**Search bar** (mx-16, mt-16, flex gap-8):
- "Flight number" input (search icon, placeholder "e.g. QQ101", flex-1, rounded-xl, border, h-48)
- "Search" button (primary, rounded-xl, px-16, h-48, label-md)

**Status card** (mx-16, mt-16, surface-container-lowest, rounded-xl, border, p-16):

Variant: On Time
- Status badge: "🟢 On Time" (success green bg/10, border success/20, rounded-full, label-md)
- Route: "QQ101 · BKK → SYD" (headline-md)
- Timeline: "08:00 BKK → 16:30 SYD" (mono-data, on-surface)
- Gate: "Gate F12 · Terminal 1" (label-md)
- Aircraft: "Boeing 737-800" (label-sm, on-surface-variant)
- "Last updated 2 minutes ago" (label-sm, on-surface-variant)

Variant: Delayed
- Status badge: "🟡 Delayed 45 min" (warning amber)
- New departure: "08:00 → 08:45" (original crossed out in error color, new in primary)
- "New arrival: 17:15" (recalculated)
- "Reason: Air traffic control delay" (label-sm, on-surface-variant)

**Departures board** (mx-16, mt-24, label "Today's Departures from BKK", label-md):
- Table-style rows (each: mono-data font): Flight | Route | Time | Gate | Status
- Status chips: On Time (green), Delayed (amber), Boarding (primary-container), Gate Open (primary)

---

### SCREEN: airport_info
**Context:** Airport guide. Opens from travel_prep_checklist or search.

**Header:** Back arrow + "Airport Guide" (headline-md).

**Airport selector tabs** (BKK | SYD — horizontal tabs):

**BKK Suvarnabhumi** content:

**Terminal map card** (mx-16, mt-16, surface-container, rounded-xl, p-16, border):
- Schematic terminal diagram (simplified: departures, arrivals, transit)
- International departures: 3rd floor
- Qoomlee check-in: Counters G1–G20 (label, highlighted in primary)

**Info cards** (mx-16, mt-16, space-y-12):
- ⏱ "Check-in counter opens 3 hours before departure"
- 🔒 "Security checkpoint: Arrive 90 min before, allow extra time"
- 🍽 "Airside dining: 20+ restaurants post-security · Opens 05:00"
- 🚘 "AOT Express train: Phaya Thai → BKK in 30 min · ฿90"
- 💴 "Currency exchange: Available airside and landside"
- 📶 "Free WiFi: 'Airporttrue' network · No password"

**Key locations** (horizontal card scroll): Check-in counters | Security | Gate F | Lounges | Transit hotel

---

### SCREEN: customer_support
**Context:** Help & support screen.

**Header:** Back arrow + "Help & Support" (headline-md).

**Search bar** (mx-16, mt-16): "Search help articles…" (search icon, rounded-xl)

**Quick help chips** (horizontal scroll, mx-16, mt-12, gap-8):
- "Cancellations" | "Baggage" | "Check-in" | "Refunds" | "Special assistance"

**Live support card** (mx-16, mt-16, secondary bg, rounded-xl, p-16, text white):
- "Chat with us" (headline-md) + support_agent icon
- "Average wait time: 3 minutes" (label-sm, white/80)
- "Start Chat" button (white bg, primary text, rounded-xl, h-48, full-width)

**Contact options** (mx-16, mt-16, space-y-12):
Each row (surface-container-lowest, rounded-xl, border, p-16, flex gap-16 items-center):
- phone icon + "Call +66 2 xxx xxxx · 24/7" + chevron_right
- email icon + "Email support · Reply within 24h" + chevron_right
- forum icon + "Community forum" + chevron_right

**FAQ sections** (mx-16, mt-24, space-y-8, expandable accordion):
- "How do I cancel my booking?"
- "Can I change my seat after booking?"
- "What is the baggage allowance?"
- "How do I request a wheelchair?"
- "Where is my refund?"
Each: chevron expands answer text in label-sm on-surface-variant

---

### SCREEN: account_settings
**Context:** User profile and preferences. Accessible from header avatar tap.

**Header:** Back arrow + "Account" (headline-md).

**Profile card** (mx-16, mt-16, secondary bg, rounded-xl, p-24, flex gap-16 items-center):
- Avatar (64×64, rounded-full, border-2 white)
- Name (headline-md, white) + email (label-sm, white/80)
- "Edit Profile" chip (white/20 bg, white text, rounded-full, label-md)

**Settings sections** (mx-16, mt-16, space-y-8):

**Personal Information** (surface-container-lowest, rounded-xl, border, divide-y divide-outline-variant/30):
- "Full name" row + value + chevron_right
- "Email" row
- "Phone" row
- "Date of birth" row
- "Nationality" row

**Travel Documents** (surface-container-lowest, rounded-xl, border, divide-y):
- "Passport / ID" row + "Expires Mar 2027" + edit icon
- "Add document" row (dashed, add icon, primary)

**Preferences** (surface-container-lowest, rounded-xl, border, divide-y):
- "Language" row + "English" + chevron_right
- "Currency" row + "THB (฿)" + chevron_right
- "Notifications" row + toggle switch (ON)
- "Dark mode" row + toggle switch (OFF)

**Saved Payment Methods** (surface-container-lowest, rounded-xl, border):
- Visa ending 4532 + "Primary" chip + delete icon
- "Add payment method" (add icon, primary, label-md)

**Danger zone** (mt-24):
- "Sign Out" button (outlined, error border, error text, full-width, h-48, rounded-xl)
- "Delete Account" text link (error, label-md, centered, mt-8)

---

# ═══════════════════════════════════════════
# INTERACTION & STATE SPECIFICATIONS
# ═══════════════════════════════════════════

## Loading States
Every screen that fetches data must show:
- Skeleton loaders (surface-container-high bg, rounded-xl, animated pulse) matching the shape of the real content
- Full-screen overlay spinner for critical operations (payment processing, check-in submission)
- "Searching for flights…" with animated plane icon for flight search
- Inline spinners (24px, primary) for button loading states — replace button text with spinner + status text

## Empty States
Each list/result screen must handle empty state:
- Center-aligned illustration (Material icon, 80px, outline-variant)
- Descriptive headline (headline-md, on-surface)
- Sub-text explanation (body-md, on-surface-variant)
- CTA button where appropriate
Examples:
- No flights: "No flights found · Try adjusting your dates or filters"
- No bookings: "No bookings yet · Search for your first flight"
- No results: "Nothing here · Check back later"

## Error States
- **Network error banner** (error-container bg, full-width, fixed top below header, flex items-center gap-12): wifi_off icon + "No connection. Some features may be unavailable." with retry button
- **Form field error**: red border (error color), error message below field (label-sm, error color, left-aligned)
- **Full-page error**: error (80px, error color) + "Something went wrong" + "Try again" + "Contact support" buttons
- **Session expired**: overlay modal "Your session expired. Sign in again." (primary button)

## Success Feedback
- **Snackbar/Toast** (bottom of screen above nav, surface-container-lowest, rounded-xl, shadow-lg, p-16, flex gap-12, auto-dismiss 3s):
  - check_circle (success green) + message text + optional "Undo" action
  - Examples: "Copied!", "Seat saved", "Reminder set"
- **Page-level success**: green banner at top with check_circle and message

## Accessibility Requirements
- All interactive elements: min 44×44px touch targets
- Colour contrast: minimum 4.5:1 for normal text, 3:1 for large text
- All icons have aria-label or sr-only text
- Focus rings visible (primary color, 2px, offset 2px) for keyboard navigation
- Form errors associated to inputs via aria-describedby
- Images have meaningful alt text (describe content, not "image of")
- QR codes have alt text explaining their purpose

## Typography Hierarchy (reminder per screen)
- Page title: headline-lg-mobile (24px, 700, -0.01em)
- Section heading: headline-md (20px, 600)
- Card title: label-md (14px, 600, +0.01em)
- Body copy: body-md (16px, 400)
- Metadata / secondary info: label-sm (12px, 500, +0.02em)
- Flight codes / data: mono-data (14px, 500, +0.05em)

---

# ═══════════════════════════════════════════
# SCREEN GENERATION CHECKLIST
# ═══════════════════════════════════════════

Generate screens in this order to ensure design consistency:

## Booking Flow (generate first — establishes patterns)
- [ ] flight_search (refresh from this prompt)
- [ ] date_calendar
- [ ] traveler_selector
- [ ] flight_results (refresh)
- [ ] flight_detail
- [ ] flight_filters
- [ ] passenger_info (NEW)
- [ ] special_requests_modal
- [ ] seat_selection (refresh — booking variant)
- [ ] travel_requirements (refresh)
- [ ] visa_checker
- [ ] vaccination_upload
- [ ] travel_insurance
- [ ] payment (NEW)
- [ ] payment_3ds
- [ ] booking_confirmation (refresh)
- [ ] booking_details
- [ ] travel_prep_checklist

## Check-in Flow
- [ ] online_check_in (refresh)
- [ ] checkin_eligibility (all 4 variants)
- [ ] select_passengers (refresh)
- [ ] check_in_details (refresh — all 5 tabs)
- [ ] review_check_in (refresh)
- [ ] boarding_pass (refresh)
- [ ] boarding_pass_multiple

## Manage Booking
- [ ] manage_booking (refresh)
- [ ] change_flight
- [ ] refund_request
- [ ] additional_services

## Auth Flow
- [ ] login
- [ ] register
- [ ] forgot_password

## Utility
- [ ] flight_status (all status variants)
- [ ] airport_info
- [ ] customer_support
- [ ] account_settings

**Total: 38 screens** (12 refreshed + 26 new)
