import { useState } from 'react'
import imgBanner from './imports/BookingPage/9c7ec2901f9b5130ef7b1181e485cdfcefca4e94.png'
import imgPortrait0 from './imports/BookingPage/bf02ea2d1ac722ada6b3a96eb3702cca9ef3c787.png'
import imgResult0 from './imports/BookingPage/65e90f1ced7a162e091bfe17ce4fab6d9fdd5d49.png'
import imgPortrait1 from './imports/BookingPage/0979b84a09b830c3d2021505a1dcd2b5edf1d49b.png'
import imgResult1 from './imports/BookingPage/e2b3a49e19b2235a8b2b2fb0778d6f01c043eb01.png'
import imgPortrait2 from './imports/BookingPage/d36224681862f929824342c96141b7741e26be4e.png'
import imgResult2 from './imports/BookingPage/f35514d63e0a2e68f19235861fd84fc064a3f10f.png'
import imgPortrait3 from './imports/BookingPage/640be59dfca5b95d4828d73a42ba44c39ae8083a.png'
import imgResult3 from './imports/BookingPage/efd6d2dd0eeb3a6cbebd9504a0cf835105460468.png'
import imgStudio1 from './imports/BookingPage/64e087e1db145663921cbf34bbf825dd736ef29d.png'
import imgStudio2 from './imports/BookingPage/3a7cc1f1a3467bfd54bc1b18b8fe23e20776ebc9.png'
import imgEventSpace1 from './imports/BookingPage/9b2628a26bdee90bbbff75322b71d89ae244f9c3.png'
import imgEventSpace2 from './imports/BookingPage/d5d788675dd051e537403e391bd260a250c71e6b.png'
import imgLogo from './imports/BookingPage/669f5959e820a52413c1d60f819791df81c67bb5.png'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'service' | 'addons' | 'details' | 'success'
type ServiceType = 'rental' | 'creative' | null
type CreativeSession = 'portrait' | 'duo' | 'sama-sama' | 'executive' | null
type SamaSamaGroup = '3-5' | '6-10' | '11-15+' | null
type ExecutiveLayout = '1' | '2' | null
type ExecutiveGroup = '3-5' | '6-8' | null
type RentalType = 'studio' | 'event' | null

interface BookingState {
  step: Step
  serviceType: ServiceType
  creativeSession: CreativeSession
  samaSamaGroup: SamaSamaGroup
  executiveLayout: ExecutiveLayout
  executiveGroup: ExecutiveGroup
  plusPackage: boolean
  creativeAddons: Set<string>
  editedPhotosCount: number
  additionalPaxCount: number
  rentalType: RentalType
  rentalHours: number
  rentalAddons: Set<string>
  coloredPaperSheets: number
  rentalEditedPhotosCount: number
  form: {
    fullName: string
    companyName: string
    email: string
    phone: string
    numberOfGuests: string
    hasPets: boolean
    petCount: string
    facebookHandle: string
    instagramHandle: string
    primaryDate: string
    altDate1: string
    altDate2: string
    notes: string
  }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const SESSION_PRICES: Record<string, number> = {
  portrait: 3500,
  duo: 5000,
  'sama-sama-3-5': 5500,
  'sama-sama-6-10': 7500,
  'sama-sama-11-15+': 10000,
  'executive-1': 8000,
  'executive-2': 10000,
}
const PLUS_PRICE = 1500
const STUDIO_RATE = 1700
const EVENT_RATE = 2500

const CREATIVE_ADDONS = [
  { id: 'additional-pax', label: 'Additional Pax', price: 1700, unit: '/pax', hasQty: true, qtyLabel: 'Number of Additional Pax' },
  { id: 'session-extension', label: 'Session Extension +1hr', price: 2000, unit: '', hasQty: false, qtyLabel: '' },
  { id: 'edited-photo', label: 'Edited Photo', price: 1000, unit: '/photo', hasQty: true, qtyLabel: 'Desired Number of Edited Photos' },
  { id: 'pet-inclusion', label: 'Pet Inclusion', price: 500, unit: '', hasQty: false, qtyLabel: '' },
]
const RENTAL_ADDONS = [
  { id: 'colored-paper', label: 'Colored Paper', price: 1800, unit: '/sheet', hasQty: true, qtyLabel: 'Desired Number of Sheets' },
  { id: 'moveable-background', label: 'Moveable Background', price: 1000, unit: '', hasQty: false, qtyLabel: '' },
  { id: 'edited-photo', label: 'Edited Photo', price: 1000, unit: '/photo', hasQty: true, qtyLabel: 'Desired Number of Edited Photos' },
]

const SESSION_DATA = {
  portrait: { title: 'Portrait Session', desc: 'Solo professional portraits in studio with expert lighting and direction.', images: [imgPortrait0, imgResult0], paxLabel: 'Solo (1 person)' },
  duo: { title: 'Duo Session', desc: 'Beautiful portraits for two — couples, siblings, or best friends.', images: [imgPortrait1, imgResult1], paxLabel: '2 people' },
  'sama-sama': { title: 'Sama-Sama Session', desc: 'Group portraits for friends, families, or teams, designed for coordinated shots together.', images: [imgPortrait2, imgResult2], paxLabel: '' },
  executive: { title: 'Executive Session', desc: 'Premium corporate portraits with custom layout options for professionals and teams.', images: [imgPortrait3, imgResult3], paxLabel: '' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return `₱${n.toLocaleString()}` }

function getSessionKey(s: BookingState): string | null {
  if (!s.creativeSession) return null
  if (s.creativeSession === 'portrait') return 'portrait'
  if (s.creativeSession === 'duo') return 'duo'
  if (s.creativeSession === 'sama-sama') return s.samaSamaGroup ? `sama-sama-${s.samaSamaGroup}` : null
  if (s.creativeSession === 'executive') return s.executiveLayout ? `executive-${s.executiveLayout}` : null
  return null
}

function getPreviewTitle(s: BookingState): string {
  if (!s.creativeSession) return ''
  const base = SESSION_DATA[s.creativeSession].title
  return s.plusPackage ? `${base} Plus` : base
}

function getPaxSubtext(s: BookingState): string {
  if (s.creativeSession === 'sama-sama' && s.samaSamaGroup) return `${s.samaSamaGroup} pax`
  if (s.creativeSession === 'executive') {
    const parts = []
    if (s.executiveLayout) parts.push(`${s.executiveLayout} Layout${s.executiveLayout === '2' ? 's' : ''}`)
    if (s.executiveGroup) parts.push(`${s.executiveGroup} pax`)
    return parts.join(', ')
  }
  if (s.creativeSession) return SESSION_DATA[s.creativeSession].paxLabel
  return ''
}

function calcTotal(s: BookingState): number {
  if (s.serviceType === 'creative') {
    const key = getSessionKey(s)
    if (!key) return 0
    let t = SESSION_PRICES[key] || 0
    if (s.plusPackage) t += PLUS_PRICE
    if (s.creativeAddons.has('additional-pax')) t += 1700 * Math.max(1, s.additionalPaxCount)
    if (s.creativeAddons.has('session-extension')) t += 2000
    if (s.creativeAddons.has('edited-photo')) t += 1000 * Math.max(1, s.editedPhotosCount)
    if (s.creativeAddons.has('pet-inclusion')) t += 500
    return t
  }
  if (s.serviceType === 'rental') {
    if (!s.rentalType) return 0
    const rate = s.rentalType === 'studio' ? STUDIO_RATE : EVENT_RATE
    let t = rate * s.rentalHours
    if (s.rentalAddons.has('colored-paper')) t += 1800 * Math.max(1, s.coloredPaperSheets)
    if (s.rentalAddons.has('moveable-background')) t += 1000
    if (s.rentalAddons.has('edited-photo')) t += 1000 * Math.max(1, s.rentalEditedPhotosCount)
    return t
  }
  return 0
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Service Type', 'Add-ons', 'Your Details']
const STEP_KEYS: Step[] = ['service', 'addons', 'details']

function StepIndicator({ current }: { current: Step }) {
  const idx = STEP_KEYS.indexOf(current)
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${done || active ? 'bg-[#52d530]' : 'bg-[#e5e7eb]'}`}>
                {done ? (
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <path d="M3 8l3.5 3.5 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className={`text-sm font-medium ${active ? 'text-white' : 'text-[#6b7280]'}`}>{i + 1}</span>
                )}
              </div>
              <span className={`text-sm whitespace-nowrap ${active ? 'text-[#102336] font-medium' : done ? 'text-[#102336]' : 'text-[#99a1af]'}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 shrink-0 mx-2 text-[#d1d5dc]">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function ServicePreviewCard({ s }: { s: BookingState }) {
  const { serviceType, creativeSession } = s

  // No selection yet
  if (!serviceType) {
    return (
      <div className="bg-[#102336] rounded-[14px] p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/30">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-white/40 text-sm text-center">Select a service to preview</p>
      </div>
    )
  }

  // Rental preview
  if (serviceType === 'rental') {
    const isEvent = s.rentalType === 'event'
    const title = s.rentalType === 'studio' ? 'Creative Studio Rental' : s.rentalType === 'event' ? 'Private Event Rental' : 'Rental Services'
    const desc = s.rentalType === 'studio'
      ? 'Professional photography studio with full equipment. Minimum 3 hours.'
      : s.rentalType === 'event'
      ? 'Private event space for productions, events, and workshops. Minimum 4 hours.'
      : 'Studio Rental, Private Events, Workshops.'
    const photos = isEvent ? [imgEventSpace1, imgEventSpace2] : [imgStudio1, imgStudio2]

    return (
      <div className="bg-[#102336] rounded-[14px] p-6 flex flex-col gap-4">
        <div>
          <p className="text-white font-black text-xl leading-snug" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>{title}</p>
          <p className="text-[#99a1af] text-sm mt-1.5 leading-relaxed">{desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {photos.map((img, i) => (
            <div key={i} className="rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img src={img} alt="" className="w-full h-full object-cover"/>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Creative — no session yet
  if (!creativeSession) {
    return (
      <div className="bg-[#102336] rounded-[14px] p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white/30">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-white/40 text-sm text-center">Select a photography package to preview</p>
      </div>
    )
  }

  // Creative — session selected
  const data = SESSION_DATA[creativeSession]
  const title = getPreviewTitle(s)

  return (
    <div className="bg-[#102336] rounded-[14px] p-6 flex flex-col gap-4">
      <div>
        <p className="text-white font-black text-xl leading-snug" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>{title}</p>
        <p className="text-[#99a1af] text-sm mt-1.5 leading-relaxed">{data.desc}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.images.map((img, i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img src={img} alt="" className="w-full h-full object-cover"/>
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveEstimateCard({ s }: { s: BookingState }) {
  const total = calcTotal(s)
  const sessionKey = getSessionKey(s)
  const sessionBase = sessionKey ? (SESSION_PRICES[sessionKey] || 0) : null
  const paxSub = getPaxSubtext(s)

  // Addon rows
  const addonRows: { label: string; price: number }[] = []
  if (s.serviceType === 'creative') {
    if (s.plusPackage) addonRows.push({ label: 'Plus Package (H&M)', price: PLUS_PRICE })
    if (s.creativeAddons.has('additional-pax')) addonRows.push({ label: `Additional Pax ×${Math.max(1, s.additionalPaxCount)}`, price: 1700 * Math.max(1, s.additionalPaxCount) })
    if (s.creativeAddons.has('session-extension')) addonRows.push({ label: 'Session Extension +1hr', price: 2000 })
    if (s.creativeAddons.has('edited-photo')) addonRows.push({ label: `Edited Photos ×${Math.max(1, s.editedPhotosCount)}`, price: 1000 * Math.max(1, s.editedPhotosCount) })
    if (s.creativeAddons.has('pet-inclusion')) addonRows.push({ label: 'Pet Inclusion', price: 500 })
  }
  if (s.serviceType === 'rental') {
    if (s.rentalAddons.has('colored-paper')) addonRows.push({ label: `Colored Paper ×${Math.max(1, s.coloredPaperSheets)} sheet`, price: 1800 * Math.max(1, s.coloredPaperSheets) })
    if (s.rentalAddons.has('moveable-background')) addonRows.push({ label: 'Moveable Background', price: 1000 })
    if (s.rentalAddons.has('edited-photo')) addonRows.push({ label: `Edited Photos ×${Math.max(1, s.rentalEditedPhotosCount)}`, price: 1000 * Math.max(1, s.rentalEditedPhotosCount) })
  }

  const packageName = s.serviceType === 'creative'
    ? (s.creativeSession ? getPreviewTitle(s) : null)
    : s.rentalType === 'studio' ? 'Creative Studio Rental' : s.rentalType === 'event' ? 'Private Event Rental' : null

  const packagePrice = s.serviceType === 'creative'
    ? sessionBase
    : s.rentalType ? (s.rentalType === 'studio' ? STUDIO_RATE : EVENT_RATE) * s.rentalHours : null

  const packageSub = s.serviceType === 'rental' && s.rentalType
    ? `${s.rentalHours} Hours`
    : paxSub || null

  return (
    <div className="bg-[#102336] rounded-[14px] p-6 flex flex-col gap-5">
      <p className="text-white font-black text-2xl" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>Live Estimate</p>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[#99a1af] text-sm shrink-0">Service Type</span>
          <span className="text-white text-sm font-medium text-right">
            {s.serviceType === 'creative' ? 'Creative Services' : s.serviceType === 'rental' ? 'Rental Services' : 'Not Selected'}
          </span>
        </div>

        {packageName && (
          <div className="flex items-start justify-between gap-3">
            <span className="text-[#99a1af] text-sm shrink-0">Package</span>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-white text-sm font-medium">{packageName}</span>
                {packagePrice !== null && (
                  <span className="text-[#52d530] text-sm font-black whitespace-nowrap" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>{fmt(packagePrice)}</span>
                )}
              </div>
              {packageSub && <p className="text-[#99a1af] text-xs mt-0.5">{packageSub}</p>}
            </div>
          </div>
        )}

        {addonRows.map(row => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <span className="text-[#99a1af] text-sm">{row.label}</span>
            <span className="text-[#52d530] text-sm font-black whitespace-nowrap" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>+{fmt(row.price)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15 pt-4 flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-2">
          <span className="text-[#d1d5dc] text-sm">Estimated Total</span>
          <span className="text-[#52d530] text-[32px] font-black leading-none" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>
            {fmt(total)}
          </span>
        </div>
        <p className="text-[#99a1af] text-[11px]">*Final price may vary based on specific requirements</p>
      </div>
    </div>
  )
}

function RightPanel({ s }: { s: BookingState }) {
  return (
    <div className="w-[380px] xl:w-[420px] shrink-0 sticky top-6 flex flex-col gap-4 self-start">
      <ServicePreviewCard s={s}/>
      <LiveEstimateCard s={s}/>
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function CantFindCard() {
  return (
    <div className="rounded-[14px] border border-[#e5e7eb] p-6 flex items-start gap-4" style={{ background: 'linear-gradient(90deg, #f9fafb, #f3f4f6)' }}>
      <div className="flex-1">
        <p className="font-bold text-[#102336] text-sm">{"Can't find what you need?"}</p>
        <p className="text-[#4a5565] text-sm mt-1 leading-relaxed">Looking for customized brand costs, retainer partnerships, or something unique?</p>
        <a href="#" className="text-[#52d530] text-sm underline underline-offset-2 mt-2 inline-block">Contact us for custom inquiries →</a>
      </div>
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#52d530] shrink-0 mt-0.5">
        <path d="M10 1.667A8.333 8.333 0 1 0 10 18.334 8.333 8.333 0 0 0 10 1.667zM10 14.167h.008M7.5 7.917a2.5 2.5 0 0 1 5 0c0 1.667-2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function Divider() { return <div className="h-px bg-[#e5e7eb]"/> }

function QtyControl({ value, onChange, min = 1, max = 30 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center rounded-lg border border-[#9995ac] overflow-hidden">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 flex items-center justify-center text-[#52d530] hover:bg-[#52d530]/10 font-bold text-base cursor-pointer">−</button>
      <span className="w-8 text-center text-sm font-medium text-[#272734]">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 flex items-center justify-center text-[#52d530] hover:bg-[#52d530]/10 font-bold text-base cursor-pointer">+</button>
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel, nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="px-6 py-2 rounded-lg text-sm font-medium border border-[#e5e7eb] bg-white text-[#0a0a0a] hover:bg-[#f9fafb] cursor-pointer transition-colors">Back</button>
      ) : <div/>}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`px-7 py-2.5 rounded-lg text-sm font-medium transition-colors ${nextDisabled ? 'bg-[#e5e7eb] text-[#99a1af] cursor-not-allowed' : 'bg-[#52d530] text-white hover:bg-[#42c020] cursor-pointer'}`}
      >{nextLabel}</button>
    </div>
  )
}

// ─── Step 1: Service Type ─────────────────────────────────────────────────────

// Rental building icon
function IconBuilding({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={active ? '#52d530' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

// Camera icon
function IconCamera({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={active ? '#52d530' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

// Service type card (side by side)
function ServiceTypeCard({ selected, onClick, icon, title, subtitle }: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-[14px] p-5 text-left transition-all cursor-pointer flex flex-col gap-3 ${selected ? 'border-2 border-[#52d530] bg-[rgba(82,213,48,0.04)]' : 'border-2 border-[#e5e7eb] bg-white hover:border-[#52d530]/40'}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-[#52d530]/15' : 'bg-[#f3f4f6]'}`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-[#102336] text-sm">{title}</p>
        <p className="text-[#6b7280] text-xs mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </button>
  )
}

// Radio row — a single selectable item (separate per option)
function RadioRow({ selected, onSelect, label, children }: {
  selected: boolean; onSelect: () => void; label: string; children?: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-3 py-3 px-1 text-left cursor-pointer group"
      >
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? 'border-[#52d530]' : 'border-[#d1d5dc] group-hover:border-[#52d530]/50'}`}>
          {selected && <div className="w-2 h-2 rounded-full bg-[#52d530]"/>}
        </div>
        <span className={`text-sm transition-colors ${selected ? 'text-[#102336] font-medium' : 'text-[#4a5565]'}`}>{label}</span>
      </button>
      {selected && children && (
        <div className="mt-1 mb-2">{children}</div>
      )}
    </div>
  )
}

// Group size picker cards (Sama-Sama)
function GroupSizePicker({
  options, value, onChange
}: {
  options: { id: string; label: string; sublabel: string; icon: React.ReactNode }[]
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-3 pt-1 pl-7">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex-1 rounded-[10px] p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all border-2 ${value === opt.id ? 'border-[#52d530] bg-[rgba(82,213,48,0.06)]' : 'border-[#e5e7eb] bg-white hover:border-[#52d530]/40'}`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${value === opt.id ? 'text-[#52d530]' : 'text-[#6b7280]'}`}>
            {opt.icon}
          </div>
          <p className="text-[10px] text-[#6b7280] font-medium">{opt.label}</p>
          <p className={`text-sm font-bold ${value === opt.id ? 'text-[#52d530]' : 'text-[#102336]'}`}>{opt.sublabel}</p>
        </button>
      ))}
    </div>
  )
}

function PeopleIcon1() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function PeopleIcon2() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <circle cx="12" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="22" cy="10" r="4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M3 28c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22 19c4.97 0 9 4.03 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function PeopleIcon3() {
  return (
    <svg viewBox="0 0 36 32" fill="none" className="w-8 h-8">
      <circle cx="8" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="18" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="28" cy="10" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M1 28c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M11 28c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M21 28c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

// Layout card (Executive)
function LayoutCard({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-[10px] p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-all border-2 ${selected ? 'border-[#52d530] bg-[rgba(82,213,48,0.06)]' : 'border-[#e5e7eb] bg-white hover:border-[#52d530]/40'}`}
    >
      <div className={`w-8 h-8 flex items-center justify-center ${selected ? 'text-[#52d530]' : 'text-[#6b7280]'}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
      </div>
      <p className={`text-sm font-semibold ${selected ? 'text-[#52d530]' : 'text-[#102336]'}`}>{label}</p>
    </button>
  )
}

const SAMA_GROUPS = [
  { id: '3-5' as SamaSamaGroup, label: 'Small Group', sublabel: '3-5', icon: <PeopleIcon1/> },
  { id: '6-10' as SamaSamaGroup, label: 'Medium Group', sublabel: '6-10', icon: <PeopleIcon2/> },
  { id: '11-15+' as SamaSamaGroup, label: 'Large Group', sublabel: '11-15+', icon: <PeopleIcon3/> },
]

const EXEC_GROUPS = [
  { id: '3-5' as ExecutiveGroup, label: 'Small Group', sublabel: '3-5', icon: <PeopleIcon1/> },
  { id: '6-8' as ExecutiveGroup, label: 'Medium Group', sublabel: '6-8', icon: <PeopleIcon2/> },
]

function ServiceTypeStep({ s, upd, onNext }: { s: BookingState; upd: (p: Partial<BookingState>) => void; onNext: () => void }) {
  const canContinue = Boolean(
    (s.serviceType === 'creative' && s.creativeSession && (
      s.creativeSession === 'portrait' ||
      s.creativeSession === 'duo' ||
      (s.creativeSession === 'sama-sama' && s.samaSamaGroup) ||
      (s.creativeSession === 'executive' && s.executiveLayout && s.executiveGroup)
    )) ||
    (s.serviceType === 'rental' && s.rentalType)
  )

  function selectService(type: 'rental' | 'creative') {
    upd({ serviceType: type, creativeSession: null, samaSamaGroup: null, executiveLayout: null, executiveGroup: null, rentalType: null })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[30px] font-black text-[#102336] leading-tight" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>Choose Your Service Type</h2>
        <p className="text-[#6b7280] text-sm mt-1">Select the type of session you'd like to book</p>
      </div>

      {/* Service type cards — 2 columns */}
      <div className="flex gap-4">
        <ServiceTypeCard
          selected={s.serviceType === 'rental'}
          onClick={() => selectService('rental')}
          icon={<IconBuilding active={s.serviceType === 'rental'}/>}
          title="Rental Services"
          subtitle="Studio Rental, Private Events, Workshops."
        />
        <ServiceTypeCard
          selected={s.serviceType === 'creative'}
          onClick={() => selectService('creative')}
          icon={<IconCamera active={s.serviceType === 'creative'}/>}
          title="Creative Services"
          subtitle="Portrait Session, Duo Session, Sama-Sama Session, Executive Session."
        />
      </div>

      {/* Creative sub-options */}
      {s.serviceType === 'creative' && (
        <>
          <Divider/>
          <div>
            <p className="text-[#0a0a0a] font-medium text-sm mb-1">Select Photography Package</p>
            <div className="flex flex-col">
              {/* Portrait */}
              <RadioRow
                selected={s.creativeSession === 'portrait'}
                onSelect={() => upd({ creativeSession: 'portrait', samaSamaGroup: null, executiveLayout: null, executiveGroup: null })}
                label="Portrait Session"
              />
              <Divider/>
              {/* Duo */}
              <RadioRow
                selected={s.creativeSession === 'duo'}
                onSelect={() => upd({ creativeSession: 'duo', samaSamaGroup: null, executiveLayout: null, executiveGroup: null })}
                label="Duo Session"
              />
              <Divider/>
              {/* Sama-Sama */}
              <RadioRow
                selected={s.creativeSession === 'sama-sama'}
                onSelect={() => upd({ creativeSession: 'sama-sama', samaSamaGroup: null, executiveLayout: null, executiveGroup: null })}
                label="Sama-Sama Session"
              >
                <GroupSizePicker
                  options={SAMA_GROUPS}
                  value={s.samaSamaGroup}
                  onChange={(v) => upd({ samaSamaGroup: v as SamaSamaGroup })}
                />
              </RadioRow>
              <Divider/>
              {/* Executive */}
              <RadioRow
                selected={s.creativeSession === 'executive'}
                onSelect={() => upd({ creativeSession: 'executive', samaSamaGroup: null, executiveLayout: null, executiveGroup: null })}
                label="Executive Session (Corporate)"
              >
                <div className="flex flex-col gap-3 pl-7">
                  <div>
                    <p className="text-xs text-[#6b7280] font-medium mb-2">Number of Layouts</p>
                    <div className="flex gap-2">
                      <LayoutCard selected={s.executiveLayout === '1'} onClick={() => upd({ executiveLayout: '1' })} label="1 Layout"/>
                      <LayoutCard selected={s.executiveLayout === '2'} onClick={() => upd({ executiveLayout: '2' })} label="2 Layouts"/>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#6b7280] font-medium mb-2">Group Size</p>
                    <GroupSizePicker
                      options={EXEC_GROUPS}
                      value={s.executiveGroup}
                      onChange={(v) => upd({ executiveGroup: v as ExecutiveGroup })}
                    />
                  </div>
                </div>
              </RadioRow>
            </div>
          </div>

          {/* Plus Package — only shown after session selected */}
          {s.creativeSession && (
            <>
              <Divider/>
              <div>
                <p className="text-[#0a0a0a] font-medium text-sm mb-3">Plus Package (Optional)</p>
                <button
                  onClick={() => upd({ plusPackage: !s.plusPackage })}
                  className={`w-full rounded-[10px] p-4 flex items-start gap-4 text-left cursor-pointer transition-all border-2 ${s.plusPackage ? 'border-[#52d530] bg-[rgba(82,213,48,0.04)]' : 'border-[#e5e7eb] bg-white hover:border-[#52d530]/30'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${s.plusPackage ? 'bg-[#030213] border-[#030213]' : 'bg-white border-[#d1d5dc]'}`}>
                    {s.plusPackage && (
                      <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3">
                        <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#102336]">Hair & Makeup (H&M)</p>
                      <span className="text-[#52d530] text-sm font-black whitespace-nowrap" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>+{fmt(PLUS_PRICE)}</span>
                    </div>
                    <p className="text-xs text-[#6b7280] mt-0.5">Professional hair and makeup styling included with your session</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Rental sub-options */}
      {s.serviceType === 'rental' && (
        <>
          <Divider/>
          <div>
            <p className="text-[#0a0a0a] font-medium text-sm mb-1">Select Rental Type</p>
            <div className="flex flex-col">
              <RadioRow
                selected={s.rentalType === 'studio'}
                onSelect={() => upd({ rentalType: 'studio', rentalHours: 3 })}
                label="Creative Studio Rental"
              >
                <p className="text-xs text-[#6b7280] pl-7 mb-1">Professional photography studio — minimum 3 hours</p>
              </RadioRow>
              <Divider/>
              <RadioRow
                selected={s.rentalType === 'event'}
                onSelect={() => upd({ rentalType: 'event', rentalHours: 4 })}
                label="Private Event Rental"
              >
                <p className="text-xs text-[#6b7280] pl-7 mb-1">Full event venue for productions & workshops — minimum 4 hours</p>
              </RadioRow>
            </div>
          </div>

          {s.rentalType && (
            <>
              <Divider/>
              <div>
                <p className="text-[#0a0a0a] font-medium text-sm mb-3">Number of Hours</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border-2 border-[#e5e7eb] overflow-hidden">
                    <button
                      onClick={() => upd({ rentalHours: Math.max(s.rentalType === 'event' ? 4 : 3, s.rentalHours - 1) })}
                      className="w-10 h-10 flex items-center justify-center text-[#52d530] hover:bg-[#52d530]/10 font-bold text-lg cursor-pointer"
                    >−</button>
                    <span className="w-14 text-center font-semibold text-[#102336]">{s.rentalHours}</span>
                    <button
                      onClick={() => upd({ rentalHours: Math.min(12, s.rentalHours + 1) })}
                      className="w-10 h-10 flex items-center justify-center text-[#52d530] hover:bg-[#52d530]/10 font-bold text-lg cursor-pointer"
                    >+</button>
                  </div>
                  <div>
                    <p className="text-[#102336] text-sm font-medium">{s.rentalHours} {s.rentalHours === 1 ? 'hour' : 'hours'}</p>
                    <p className="text-[#52d530] text-sm font-bold">{fmt((s.rentalType === 'studio' ? STUDIO_RATE : EVENT_RATE) * s.rentalHours)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <NavButtons onNext={onNext} nextLabel="Continue to Add-ons" nextDisabled={!canContinue}/>
      <CantFindCard/>
    </div>
  )
}

// ─── Step 2: Add-ons ──────────────────────────────────────────────────────────

function AddonRow({ addon, checked, onToggle, qty, onQtyChange }: {
  addon: typeof CREATIVE_ADDONS[0]
  checked: boolean
  onToggle: () => void
  qty?: number
  onQtyChange?: (v: number) => void
}) {
  return (
    <div className={`rounded-[10px] border-2 transition-all ${checked ? 'border-[#52d530] bg-[rgba(82,213,48,0.04)]' : 'border-[#e5e7eb] bg-white'}`}>
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${checked ? 'bg-[#030213] border-[#030213]' : 'bg-white border-[#d1d5dc] hover:border-[#52d530]'}`}
        >
          {checked && (
            <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3">
              <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <span className="flex-1 text-sm font-medium text-[#102336]">{addon.label}</span>
        <span className="text-[#52d530] text-base font-black whitespace-nowrap" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>+{fmt(addon.price)}{addon.unit}</span>
      </div>
      {checked && addon.hasQty && qty !== undefined && onQtyChange && (
        <div className="border-t border-[#e5e7eb] px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-[#0a0a0a] font-medium">{addon.qtyLabel}</p>
          <QtyControl value={qty} onChange={onQtyChange}/>
        </div>
      )}
    </div>
  )
}

function AddonsStep({ s, upd, onNext, onBack }: { s: BookingState; upd: (p: Partial<BookingState>) => void; onNext: () => void; onBack: () => void }) {
  const isCreative = s.serviceType === 'creative'
  const addons = isCreative ? CREATIVE_ADDONS : RENTAL_ADDONS
  const checkedSet = isCreative ? s.creativeAddons : s.rentalAddons

  function toggle(id: string) {
    const next = new Set(checkedSet)
    next.has(id) ? next.delete(id) : next.add(id)
    upd(isCreative ? { creativeAddons: next } : { rentalAddons: next })
  }

  function getQty(id: string) {
    if (id === 'additional-pax') return s.additionalPaxCount
    if (id === 'edited-photo') return isCreative ? s.editedPhotosCount : s.rentalEditedPhotosCount
    if (id === 'colored-paper') return s.coloredPaperSheets
    return 1
  }

  function setQty(id: string, v: number) {
    if (id === 'additional-pax') upd({ additionalPaxCount: v })
    else if (id === 'edited-photo') isCreative ? upd({ editedPhotosCount: v }) : upd({ rentalEditedPhotosCount: v })
    else if (id === 'colored-paper') upd({ coloredPaperSheets: v })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[30px] font-black text-[#102336] leading-tight" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>
          Select Add-ons <span className="text-[#99a1af] text-xl font-normal" style={{ fontFamily: 'Barlow, sans-serif' }}>(Optional)</span>
        </h2>
        <p className="text-[#6b7280] text-sm mt-1">Enhance your session with additional services</p>
      </div>

      <div className="flex flex-col gap-3">
        {addons.map(addon => (
          <AddonRow
            key={addon.id}
            addon={addon}
            checked={checkedSet.has(addon.id)}
            onToggle={() => toggle(addon.id)}
            qty={addon.hasQty ? getQty(addon.id) : undefined}
            onQtyChange={addon.hasQty ? (v) => setQty(addon.id, v) : undefined}
          />
        ))}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue to Details"/>
      <CantFindCard/>
    </div>
  )
}

// ─── Step 3: Contact Details ──────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#102336]">{label}{required && <span className="text-[#ef4444] ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

function Input({ type = 'text', value, onChange, placeholder }: { type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#d1d5dc] px-4 py-2.5 text-sm text-[#102336] placeholder-[#99a1af] outline-none focus:border-[#52d530] focus:ring-1 focus:ring-[#52d530]/30 transition-colors"
    />
  )
}

function DetailsStep({ s, upd, onSubmit, onBack }: { s: BookingState; upd: (p: Partial<BookingState>) => void; onSubmit: () => void; onBack: () => void }) {
  const f = s.form
  function set(field: keyof typeof f) { return (v: string) => upd({ form: { ...f, [field]: v } }) }
  function setBool(field: keyof typeof f, v: boolean) { upd({ form: { ...f, [field]: v } }) }

  const canSubmit = Boolean(f.fullName && f.email && f.phone && f.primaryDate)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[30px] font-black text-[#102336] leading-tight" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>Your Contact Details</h2>
        <p className="text-[#6b7280] text-sm mt-1">{"Fill out the form below and we'll send you a detailed quote."}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <Input value={f.fullName} onChange={set('fullName')} placeholder="Your full name"/>
          </Field>
          <Field label="Company Name">
            <Input value={f.companyName} onChange={set('companyName')} placeholder="Company or brand (optional)"/>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email Address" required>
            <Input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com"/>
          </Field>
          <Field label="Contact Number" required>
            <Input type="tel" value={f.phone} onChange={set('phone')} placeholder="+63 9XX XXX XXXX"/>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Number of Guests">
            <Input type="number" value={f.numberOfGuests} onChange={set('numberOfGuests')} placeholder="e.g. 5"/>
          </Field>
          <Field label="With Pets?">
            <div className="flex items-center gap-3 h-[42px]">
              <button
                onClick={() => setBool('hasPets', !f.hasPets)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${f.hasPets ? 'bg-[#52d530]' : 'bg-[#e5e7eb]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.hasPets ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
              <span className="text-sm text-[#4a5565]">{f.hasPets ? 'Yes' : 'No'}</span>
              {f.hasPets && (
                <input
                  type="number"
                  value={f.petCount}
                  onChange={e => set('petCount')(e.target.value)}
                  placeholder="How many?"
                  className="flex-1 rounded-lg border border-[#d1d5dc] px-3 py-1.5 text-sm text-[#102336] placeholder-[#99a1af] outline-none focus:border-[#52d530] transition-colors"
                />
              )}
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Facebook Handle">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99a1af] text-sm">fb.com/</span>
              <input
                value={f.facebookHandle}
                onChange={e => set('facebookHandle')(e.target.value)}
                placeholder="yourpage"
                className="w-full rounded-lg border border-[#d1d5dc] pl-[60px] pr-4 py-2.5 text-sm text-[#102336] placeholder-[#99a1af] outline-none focus:border-[#52d530] focus:ring-1 focus:ring-[#52d530]/30 transition-colors"
              />
            </div>
          </Field>
          <Field label="Instagram Handle">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99a1af] text-sm">@</span>
              <input
                value={f.instagramHandle}
                onChange={e => set('instagramHandle')(e.target.value)}
                placeholder="yourusername"
                className="w-full rounded-lg border border-[#d1d5dc] pl-8 pr-4 py-2.5 text-sm text-[#102336] placeholder-[#99a1af] outline-none focus:border-[#52d530] focus:ring-1 focus:ring-[#52d530]/30 transition-colors"
              />
            </div>
          </Field>
        </div>

        <Divider/>

        <div>
          <p className="text-sm font-medium text-[#102336] mb-0.5">Preferred Dates <span className="text-[#ef4444]">*</span></p>
          <p className="text-xs text-[#6b7280] mb-3">Provide up to 3 date options. We'll do our best to accommodate your preferred date.</p>
          <div className="flex flex-col gap-3">
            <Field label="Primary Date" required>
              <Input type="date" value={f.primaryDate} onChange={set('primaryDate')}/>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Alternative Date 1">
                <Input type="date" value={f.altDate1} onChange={set('altDate1')}/>
              </Field>
              <Field label="Alternative Date 2">
                <Input type="date" value={f.altDate2} onChange={set('altDate2')}/>
              </Field>
            </div>
          </div>
        </div>

        <Field label="Additional Notes / Special Requests">
          <textarea
            value={f.notes}
            onChange={e => set('notes')(e.target.value)}
            placeholder="Any special requests, questions, or things we should know..."
            rows={4}
            className="w-full rounded-lg border border-[#d1d5dc] px-4 py-2.5 text-sm text-[#102336] placeholder-[#99a1af] outline-none focus:border-[#52d530] focus:ring-1 focus:ring-[#52d530]/30 transition-colors resize-none"
          />
        </Field>
      </div>

      <NavButtons onBack={onBack} onNext={onSubmit} nextLabel="Submit Consultation Request" nextDisabled={!canSubmit}/>
      <CantFindCard/>
    </div>
  )
}

// ─── Success ──────────────────────────────────────────────────────────────────

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#52d530]/15 flex items-center justify-center">
          <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
            <path d="M8 20l8 8 16-16" stroke="#52d530" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black text-[#102336] mb-3" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>Consultation Request Sent!</h2>
          <p className="text-[#4a5565] text-base leading-relaxed">{"Thank you! We've received your inquiry and will get back to you within 24-48 hours with a detailed quote."}</p>
        </div>
        <div className="bg-white rounded-[14px] border border-[#e5e7eb] p-6 w-full text-left">
          <p className="text-sm font-semibold text-[#102336] mb-3">What happens next?</p>
          <ul className="flex flex-col gap-2">
            {['We review your request and preferred dates', 'We send a detailed quote to your email', 'You confirm and we lock in your booking'].map(t => (
              <li key={t} className="flex items-start gap-2 text-sm text-[#4a5565]">
                <span className="text-[#52d530] font-bold mt-0.5 shrink-0">✓</span>{t}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onReset} className="px-8 py-3 rounded-lg bg-[#52d530] text-white font-medium hover:bg-[#42c020] cursor-pointer transition-colors">Book Another Session</button>
      </div>
    </div>
  )
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function Banner() {
  return (
    <div className="relative w-full h-[260px] overflow-hidden">
      <img src={imgBanner} alt="" className="absolute inset-0 w-full h-full object-cover object-top"/>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 100%)' }}/>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
        <img src={imgLogo} alt="Drop By Studios" className="h-9 mb-4 object-contain"/>
        <h1 className="text-white text-[44px] font-black text-center tracking-tight leading-none" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>Book a Consultation</h1>
        <p className="text-white/60 text-sm mt-2">{"Fill out the form below and we'll send you a detailed quote."}</p>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const INIT: BookingState = {
  step: 'service',
  serviceType: null,
  creativeSession: null,
  samaSamaGroup: null,
  executiveLayout: null,
  executiveGroup: null,
  plusPackage: false,
  creativeAddons: new Set(),
  editedPhotosCount: 1,
  additionalPaxCount: 1,
  rentalType: null,
  rentalHours: 3,
  rentalAddons: new Set(),
  coloredPaperSheets: 1,
  rentalEditedPhotosCount: 1,
  form: { fullName: '', companyName: '', email: '', phone: '', numberOfGuests: '', hasPets: false, petCount: '', facebookHandle: '', instagramHandle: '', primaryDate: '', altDate1: '', altDate2: '', notes: '' },
}

export default function App() {
  const [state, setState] = useState<BookingState>(INIT)
  function upd(patch: Partial<BookingState>) { setState(prev => ({ ...prev, ...patch })) }

  if (state.step === 'success') return <SuccessScreen onReset={() => setState(INIT)}/>

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Banner/>
      <div className="mx-auto px-10 py-8 flex gap-6 items-start" style={{ maxWidth: 1200 }}>
        {/* Left column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Step indicator */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] px-6 py-4">
            <StepIndicator current={state.step}/>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] px-8 py-8">
            {state.step === 'service' && (
              <ServiceTypeStep s={state} upd={upd} onNext={() => upd({ step: 'addons' })}/>
            )}
            {state.step === 'addons' && (
              <AddonsStep s={state} upd={upd} onNext={() => upd({ step: 'details' })} onBack={() => upd({ step: 'service' })}/>
            )}
            {state.step === 'details' && (
              <DetailsStep s={state} upd={upd} onSubmit={() => upd({ step: 'success' })} onBack={() => upd({ step: 'addons' })}/>
            )}
          </div>
        </div>

        {/* Right panel */}
        <RightPanel s={state}/>
      </div>
    </div>
  )
}
