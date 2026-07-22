# Booking Page — Full Two-Column Rebuild Plan

## Context
The current implementation missed the core layout pattern from the Figma design: a persistent **two-column layout** where the left column holds the form/steps and the right column holds a live service preview card and a live pricing estimate panel. This panel must update in real-time as the user makes selections and persist across all three steps. The current build collapsed everything into a single column with inline pricing — the right panel doesn't exist at all on steps 2 (rental) and 3 (contact details).

---

## Layout Architecture

### Outer wrapper
```
<div class="flex flex-row items-start gap-6 px-[100px] py-6 w-full">
  ├── LEFT COLUMN  (flex-1, min-w-[550px], max-w-[650px])
  └── RIGHT PANEL  (w-[470px], max-w-[470px], shrink-0, sticky top-6)
```

### Right Panel — Two stacked dark cards (always visible)
```
RIGHT PANEL (w-470px, dark #102336 background, rounded-[14px])
  ├── TOP CARD — Service Preview
  │   When nothing selected:  placeholder ("Select a service to preview")
  │   When creative selected:  session title + description + 2 photo thumbnails
  │   When rental selected:    rental type title + description
  │
  └── BOTTOM CARD — Live Estimate (dark #102336, rounded-[14px], p-8)
        ├── "Live Estimate" heading  (Nunito Black, 24px, white)
        ├── Row: "Service Type"  →  "Not Selected" | "Creative Services" | "Rental Services"
        ├── Row: "Package"       →  session/rental name  + subtext (pax count or hours)  [shown after selection]
        ├── [Add-on rows]        →  each selected add-on name  →  ₱ price  [shown when applicable]
        ├── Divider
        ├── "Estimated Total"    →  ₱0 → live calc  (Nunito Black, 30px, green #52D530)
        └── Disclaimer: "*Final price may vary based on specific requirements"
```

---

## Step-by-Step Content Plan

### Step 1 — Service Type (`step === 'service'`)
**Left:**
- `StepIndicator` (1 active)
- H2: "Choose Your Service Type"
- Two service cards: **Rental Services** / **Creative Services** (green border when selected)
- "Continue to Add-ons" button (disabled until selection)
- "Can't find what you need?" card

**Right (Live Estimate):**
- Service Type: "Not Selected"
- Estimated Total: ₱0

---

### Step 2A — Creative Add-ons (`step === 'addons' && serviceType === 'creative'`)
**Left:**
- `StepIndicator` (2 active)
- H2: "Select Photography Package"
- **Section: Session selector** (4 radio buttons)
  - Portrait Session
  - Duo Session
  - Sama-Sama Session
  - Executive Session (Corporate)
- **Section: Plus Package toggle** (checkbox card — Hair & Makeup)
- **Section: Additional Add-ons** (checkboxes) — *(pricing TBD — see open questions)*
- Back / "Continue to Your Details" button

**Right (Live Estimate):**
- Service Type: "Creative Services"
- Package: selected session name  + subtext pax info  (e.g., "(Solo)")
- [Add-on rows when checked]
- Estimated Total: ₱[base] + ₱[plus] + ₱[add-ons]

**Right (Preview Card, top):**
- Session title + description
- 2 portrait photo thumbnails (from the import images mapped per session)

---

### Step 2B — Rental Add-ons (`step === 'addons' && serviceType === 'rental'`)
**Left:**
- `StepIndicator` (2 active)
- H2: "Choose Your Rental Type"
- **Section: Rental type selector** (2 radio buttons)
  - Creative Studio Rental (3-hour min)
  - Private Event Rental (4-hour min)
- **Section: Hours stepper** (−/+, clamped to minimum per type)
- **Section: Add-on checkboxes** — *(pricing TBD — see open questions)*
- Back / "Continue to Your Details" button

**Right (Live Estimate):**
- Service Type: "Rental Services"
- Package: rental type name + subtext "No. of Hours: X Hours"
- [Add-on rows when checked]
- Estimated Total: (hourly rate × hours) + ₱[add-ons]

---

### Step 3 — Contact Details (`step === 'details'`)
**Left:**
- `StepIndicator` (3 active, 1+2 show checkmarks)
- H2: "Your Contact Details"
- Form fields: Full Name, Email, Phone, Preferred Date (Primary + Alt 1 + Alt 2), Notes
- Back / "Submit Consultation Request" button
- "Can't find what you need?" card

**Right (Live Estimate — full summary, no changes from step 2):**
- All selections + add-on rows + total (same as end of step 2)
- Stays visible so user can review their order before submitting

---

## State Management

```typescript
type Step = 'service' | 'addons' | 'details' | 'success'
type ServiceType = 'rental' | 'creative' | null
type CreativeSession = 'portrait' | 'duo' | 'sama-sama' | 'executive' | null
type RentalType = 'studio' | 'event' | null

// Booking state
step: Step
serviceType: ServiceType
// Creative
creativeSession: CreativeSession
plusPackage: boolean
creativeAddons: string[]        // IDs of checked add-ons
// Rental
rentalType: RentalType
rentalHours: number
rentalAddons: string[]          // IDs of checked add-ons
// Form
form: { fullName, email, phone, primaryDate, altDate1, altDate2, notes }
```

---

## Component Structure (all in `src/App.tsx`)

```
App
├── BannerHeader          — banner image + logo + "Book a Session" title + subtitle
├── [two-col wrapper]
│   ├── LEFT COLUMN
│   │   ├── StepIndicator      — 3 steps, green circle active, checkmark done
│   │   └── [step content]
│   │       ├── ServiceTypeStep
│   │       ├── CreativeAddonsStep
│   │       ├── RentalAddonsStep
│   │       └── DetailsStep
│   └── RIGHT PANEL (sticky)
│       ├── ServicePreviewCard  — dark card, photos or placeholder
│       └── LiveEstimateCard    — dark card, always present
└── SuccessScreen
```

---

## Key Design Tokens (from import)

| Token | Value |
|---|---|
| Green accent | `#52D530` |
| Dark panel bg | `#102336` |
| Body text dark | `#0a0a0a` |
| Body text mid | `#4a5565` |
| Labels/Gray | `#6b7280` |
| Estimate labels | `#d1d5dc` (on dark bg) |
| Estimate subtext | `#99a1af` |
| White divider | `rgba(255,255,255,0.2)` |
| Card border | `#e5e7eb` |
| Card border active | `#52D530` (2px) |

---

## Files to Modify

- **`src/App.tsx`** — complete rewrite with two-column layout and all steps
- **`src/index.css`** — already correct (fonts wired, no changes needed)

---

## Verification

1. Vite dev server hot-reloads — no TypeScript errors in `src/App.tsx`
2. Step 1: Selecting a service card updates Live Estimate "Service Type" row in real-time
3. Step 2 (Creative): Selecting session updates Preview Card (photos) and Live Estimate (package + price)
4. Step 2 (Creative): Toggling Plus Package adds/removes "Plus Package" row and updates total
5. Step 2 (Rental): Changing hours updates "No. of Hours" subtext and total
6. Step 3: Right panel shows full summary with no changes; Back goes to step 2
7. Submit leads to success screen
8. Mobile: columns stack vertically (Live Estimate below form)

---

## Confirmed Design Flow (from Figma export analysis)

### Step 1 — Creative path sub-options
After selecting Creative Services, the form expands inline:
- "Select Photography Package" section with 4 radio buttons (Portrait, Duo, Sama-Sama, Executive)
- After choosing Sama-Sama: group size picker appears (3-5 / 6-10 / 11-15+ people)
- After choosing Executive: layout picker (1 Layout / 2 Layouts) + group size picker (3-5 / 6-8 people)
- Plus Package checkbox (Hair & Makeup) — add-on toggle within Step 1
- "Continue to Add-ons" button unlocks once a session is chosen

### Step 1 — Rental path sub-options
After selecting Rental Services, the form expands inline:
- Rental type radio buttons (Creative Studio / Private Event)
- Hours stepper (min 3hr for studio, 4hr for events)
- "Continue to Add-ons" button

### Step 2 — Rental Add-ons (confirmed from BookingRentalsAddOnsDesktop)
- "Select Add-ons (Optional)" heading
- Colored Paper — +₱1,800/sheet → checkbox + quantity stepper ("Desired Number of Sheets")
- Moveable Background — +₱1,000 → checkbox only
- Edited Photo — +₱1,000/photo → checkbox + quantity stepper ("Desired Number of Edited Photos")
- "Back" and "Continue to Details" buttons
- "Can't find what you need?" card at bottom

### Step 2 — Creative Add-ons (no explicit Figma frames; constructed from add-on labels seen)
- "Select Add-ons (Optional)" heading
- Additional Pax — +₱1,700/pax → checkbox + quantity stepper
- Session Extension +1hr — +₱2,000 → checkbox
- Edited Photo — +₱1,000/photo → checkbox + quantity stepper
- Pet Inclusion — +₱500 → checkbox
- "Back" and "Continue to Details" buttons
- "Can't find what you need?" card at bottom

### Approximate pricing (user confirmed exact prices don't matter — flow is the priority)
| Session | Base Price |
|---|---|
| Portrait Session | ₱3,500 |
| Duo Session | ₱5,000 |
| Sama-Sama (3-5 pax) | ₱6,500 |
| Sama-Sama (6-10 pax) | ₱8,500 |
| Sama-Sama (11-15+) | ₱10,500 |
| Executive (1 layout) | ₱8,000 |
| Executive (2 layouts) | ₱10,000 |
| Plus Package (H&M) | +₱1,500 |
| Studio Rental | ₱1,700/hr (3hr min = ₱5,100) |
| Private Event Rental | ₱2,500/hr (4hr min = ₱10,000) |
