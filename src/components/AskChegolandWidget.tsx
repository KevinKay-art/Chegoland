import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { api } from '../api/client.ts';
import { useAppContext } from '../hooks/useAppContext.tsx';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export function AskChegolandWidget() {
  const { language, t } = useAppContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: t.assistant.welcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update initial greeting if user toggles language before sending messages
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', text: t.assistant.welcome }];
      }
      return prev;
    });
  }, [t.assistant.welcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const quickPrompts =
    language === 'sw'
      ? [
          'Bei ya maziwa 1L na 5L ni ngapi?',
          'Maziwa mala yana faida gani kiafya?',
          'Je, mnaleta Nairobi na kwa muda gani?',
        ]
      : [
          'What milk sizes are in stock right now?',
          'Why is pasture-fed ghee & mala healthy?',
          'When do you deliver around Kaplong, Sotik & Nairobi?',
        ];

  async function sendMessage(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const nextHistory = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await api.askChegoland({
        message: trimmed,
        history: messages,
        language,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to reach Chegoland Assistant right now.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2.5 px-4 py-3 min-h-[48px] rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold shadow-lg transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          <span>{t.assistant.buttonLabel}</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label={t.assistant.title}
          className="w-[calc(100vw-2.5rem)] sm:w-96 max-h-[75vh] bg-[#FFFDF7] rounded-2xl border border-[#D8CEB8] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="bg-[#2E7D32] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold leading-tight">
                {t.assistant.title}
              </h3>
              <p className="text-xs text-[#E8F5E9]/90">{t.assistant.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/15 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF7]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-white border border-[#E6DEC8] text-[#2C1E16]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="pt-1 space-y-1.5">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-[#D8CEB8] bg-white hover:bg-[#E8F5E9] text-[#2E7D32] font-medium transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E6DEC8] text-[#6D5649] rounded-xl px-3.5 py-2.5 text-xs">
                  Checking farm stock &amp; notes...
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="p-3 border-t border-[#E6DEC8] bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.placeholder}
              aria-label={t.assistant.placeholder}
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t.assistant.send}
              className="w-10 h-10 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-45 text-white flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
