import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import { InteractiveCharacter } from './InteractiveCharacter';

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const ContactSection: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    referenceId: string;
    notice: string;
  } | null>(null);

  const validateClient = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!/^[+\d][\d\s()-]{6,20}$/.test(phone.trim())) {
      errors.phone = 'Please enter a valid phone or WhatsApp number.';
    }
    if (message.trim().length < 10) {
      errors.message = 'Please include a short message (at least 10 characters).';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setConfirmation(null);

    const localErrors = validateClient();
    setFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, message }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitError(data.error || 'Could not record your message. Please try again.');
        return;
      }

      setConfirmation({
        referenceId: data.referenceId,
        notice: data.notice,
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setFieldErrors({});
    } catch {
      setSubmitError('Unable to reach the store server right now. Please try again shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-canvas py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Welcoming Message, Character Relaxed Animation & Store Info */}
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-accent">Store Support &amp; School Bulk Orders</p>
            <h2
              id="contact-heading"
              className="font-display mt-2 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.75rem)', lineHeight: 1.12 }}
            >
              LET&apos;S GET YOU READY FOR SCHOOL!
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Need help picking uniform sizes, assembling a full term checklist, or arranging a
              school-wide supply order? Reach out to our team and we will help you prepare
              stress-free.
            </p>

            {/* Relaxed Character Companion */}
            <div className="mt-6 hidden max-w-[340px] rounded-2xl border border-border-hairline bg-surface p-3 lg:block">
              <InteractiveCharacter variant="contact" className="w-full" />
            </div>

            {/* Store Contact Details */}
            <dl className="mt-8 space-y-4 border-t border-border-hairline pt-6 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Business Phone</dt>
                  <dd className="text-ink-muted">+256 700 123 456 (Store Desk Placeholder)</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Business Email</dt>
                  <dd className="text-ink-muted">hello@scholarpack.store</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">Physical Location</dt>
                  <dd className="text-ink-muted">
                    Plot 24 Learning Avenue, Ground Floor Shop 3 (Store Address Placeholder)
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <dt className="font-semibold text-ink">WhatsApp &amp; Socials</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-3 text-ink-muted">
                    <a
                      href="https://wa.me/256700123456"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      WhatsApp Chat
                    </a>
                    <span aria-hidden="true">·</span>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink hover:underline"
                    >
                      Instagram
                    </a>
                    <span aria-hidden="true">·</span>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink hover:underline"
                    >
                      Facebook
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Right Column: Validated Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl border border-border-hairline bg-surface p-6 shadow-xs sm:p-8"
            >
              <h3 className="font-display text-xl font-bold text-ink">Send Us a Message</h3>
              <p className="mt-1 text-sm text-ink-muted">
                All fields are validated before recording your inquiry with our store desk.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="contact-full-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    placeholder="e.g. Grace Nakato"
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/65 focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                      fieldErrors.fullName ? 'border-red-500' : 'border-border-hairline focus:border-accent'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="parent@example.com"
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/65 focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                      fieldErrors.email ? 'border-red-500' : 'border-border-hairline focus:border-accent'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    placeholder="+256 700 000 000"
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-canvas px-4 text-sm text-ink placeholder:text-ink-muted/65 focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                      fieldErrors.phone ? 'border-red-500' : 'border-border-hairline focus:border-accent'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) {
                        setFieldErrors((prev) => ({ ...prev, message: undefined }));
                      }
                    }}
                    placeholder="Tell us which school items, uniform sizes, or bundles you are looking for..."
                    className={`mt-1.5 w-full rounded-xl border bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-muted/65 focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                      fieldErrors.message ? 'border-red-500' : 'border-border-hairline focus:border-accent'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              {confirmation && (
                <div
                  role="status"
                  className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
                >
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span>Inquiry Recorded · Reference {confirmation.referenceId}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                    {confirmation.notice}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white transition-all duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
