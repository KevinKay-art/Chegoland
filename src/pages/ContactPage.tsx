import React, { useState } from 'react';
import { CheckCircle2, MapPin, MessageSquare, Phone } from 'lucide-react';
import { api } from '../api/client.ts';
import { isValidKenyanPhone } from '../utils/format.ts';

export function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidKenyanPhone(phone)) {
      setError('Please enter a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please enter your message (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await api.sendContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Farm Inquiry',
        message: message.trim(),
      });
      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-2xl mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16]">
          Contact CHEGOLAND Agri-Empire LTD Dairy Farm and Shop
        </h1>
        <p className="mt-2.5 text-base text-[#5D4B41] leading-relaxed">
          Questions about recurring household milk subscriptions, café wholesale cans, or
          weekend farm visits in Kapcholyo, Kaplong? Reach out directly below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#2C1E16]">Call Dispatch Desk</h2>
                <a
                  href="tel:+254712345678"
                  className="text-sm font-mono text-[#2E7D32] hover:underline mt-0.5 block"
                >
                  +254 712 345 678
                </a>
                <p className="text-xs text-[#6D5649] mt-0.5">Mon–Sun, 6:00 AM – 6:00 PM EAT</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 border-t border-[#F0EAD8]">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#2C1E16]">WhatsApp Orders &amp; Care</h2>
                <a
                  href="https://wa.me/254712345678?text=Hello%20Chegoland%20Dairy%20Farm!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-1.5 px-3.5 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-4 border-t border-[#F0EAD8]">
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] text-[#0284C7] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[#2C1E16]">Farm &amp; Regional Hub</h2>
                <p className="text-sm text-[#5D4B41] mt-1">
                  <strong className="font-medium text-[#2C1E16]">Farm:</strong> Kapcholyo,
                  Kaplong, Sotik Constituency, Bomet County
                </p>
                <p className="text-sm text-[#5D4B41] mt-1">
                  <strong className="font-medium text-[#2C1E16]">Dispatch Routes:</strong>{' '}
                  Kaplong – Sotik – Bomet – Kericho &amp; Nairobi Cold Express
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E6DEC8] p-6 sm:p-8">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#2C1E16]">
                Message Received
              </h2>
              <p className="text-sm text-[#5D4B41] max-w-md mx-auto">
                Thank you for reaching out to Chegoland. Our farm manager will reply via phone
                or email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 px-5 py-2 rounded-lg border border-[#D8CEB8] text-sm font-medium text-[#2C1E16] hover:bg-[#F5EFE0] cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
              <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                Send Us a Note
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-[#3E2723] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mercy Muthoni"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-[#3E2723] mb-1.5"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-[#3E2723] mb-1.5"
                  >
                    Email (Optional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mercy@example.co.ke"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-[#3E2723] mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Weekly delivery or wholesale"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-[#3E2723] mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 min-h-[44px] rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
