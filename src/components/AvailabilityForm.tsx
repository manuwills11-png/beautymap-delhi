'use client'

import { useState } from 'react'
import { MessageCircle, Mail, Copy, Check, X, CalendarHeart } from 'lucide-react'
import { cleanIndianPhone } from '@/lib/phone'

interface Props {
  salonName: string
  phone: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildMessage(salonName: string, date: string, name: string, notes: string): string {
  const day = date ? formatDate(date) : '[date TBD]'
  let msg = `Hi! I'm interested in booking bridal services at ${salonName} for my wedding on ${day}. Could you let me know if you're available?`
  if (name.trim()) msg += ` My name is ${name.trim()}.`
  if (notes.trim()) msg += ` ${notes.trim()}`
  return msg
}


export default function AvailabilityForm({ salonName, phone }: Props) {
  const [open, setOpen] = useState(false)
  const [weddingDate, setWeddingDate] = useState('')
  const [brideName, setBrideName] = useState('')
  const [notes, setNotes] = useState('')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = buildMessage(salonName, weddingDate, brideName, notes)
  const waPhone = cleanIndianPhone(phone)
  const whatsappUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}` : null
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Bridal Service Inquiry – ${salonName}`)}&body=${encodeURIComponent(message)}`
  const today = new Date().toISOString().split('T')[0]

  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-2xl bg-cream border border-line shadow-card text-ink font-medium hover:border-oxblood-300 hover:bg-oxblood-50 transition-colors [touch-action:manipulation]"
      >
        <CalendarHeart className="w-4 h-4 text-oxblood-700" strokeWidth={2} aria-hidden="true" />
        Ask About Availability
      </button>
    )
  }

  return (
    <div className="bg-cream rounded-2xl border border-line shadow-card p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-playfair text-lg font-bold text-ink">Ask About Availability</h3>
        <button
          onClick={() => {
            setOpen(false)
            setGenerated(false)
          }}
          className="grid place-items-center w-9 h-9 -mt-1 -mr-1 rounded-lg text-ink-muted hover:text-ink hover:bg-oxblood-50 transition-colors"
          aria-label="Close availability form"
        >
          <X className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-ink-muted mb-5 leading-relaxed">
        We&apos;ll help you reach out directly — salons typically respond within 24–48 hours.
      </p>

      {!generated ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setGenerated(true)
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="wedding-date" className="block text-sm font-medium text-ink mb-1.5">
              Wedding date <span className="text-oxblood-600">*</span>
            </label>
            <input
              id="wedding-date"
              type="date"
              required
              min={today}
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-line bg-cream text-ink focus:border-oxblood-400 outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="bride-name" className="block text-sm font-medium text-ink mb-1.5">
              Your name <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <input
              id="bride-name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Priya"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-line bg-cream text-ink placeholder:text-ink-muted/70 focus:border-oxblood-400 outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="inquiry-notes" className="block text-sm font-medium text-ink mb-1.5">
              Any notes <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="inquiry-notes"
              rows={2}
              placeholder="e.g. Looking for a complete bridal package with makeup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line bg-cream text-ink placeholder:text-ink-muted/70 focus:border-oxblood-400 outline-none text-sm resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-full bg-oxblood-700 text-cream font-medium hover:bg-oxblood-800 shadow-soft transition-colors [touch-action:manipulation]"
          >
            Generate message
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-ivory p-4">
            <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
          </div>

          <p className="text-xs text-ink-muted font-medium uppercase tracking-widest">Send via</p>

          <div className="flex flex-col gap-2.5">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 min-h-[48px] rounded-full bg-[#25D366] text-white font-medium hover:opacity-90 transition-opacity shadow-soft [touch-action:manipulation]"
              >
                <MessageCircle className="w-4 h-4 fill-white" strokeWidth={2} aria-hidden="true" />
                Send on WhatsApp
              </a>
            )}

            <a
              href={mailtoUrl}
              className="flex items-center justify-center gap-2 min-h-[48px] rounded-full border border-line bg-cream text-ink-soft font-medium hover:border-oxblood-300 hover:text-oxblood-700 transition-colors [touch-action:manipulation]"
            >
              <Mail className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              Email (add address)
            </a>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 min-h-[48px] rounded-full border border-oxblood-200 text-oxblood-700 font-medium hover:bg-oxblood-50 transition-colors [touch-action:manipulation]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  Copy message
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setGenerated(false)}
            className="text-xs text-oxblood-700 hover:underline w-full text-center min-h-[44px]"
          >
            ← Edit details
          </button>
        </div>
      )}
    </div>
  )
}
