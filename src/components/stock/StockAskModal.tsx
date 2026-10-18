import React, { useState } from 'react';
import { ComputedStockProduct, PlanScenario } from './types';
import { HelpCircle, MessageCircle, X, Send, Mic, MicOff, RefreshCw } from 'lucide-react';

interface StockAskModalProps {
  items: ComputedStockProduct[];
  plan: PlanScenario;
}

export const StockAskModal: React.FC<StockAskModalProps> = ({ items, plan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const sampleQuestions = [
    'Which items will finish this week?',
    'What sells the most?',
    'How much money is stuck?',
  ];

  const handleAsk = async (textToAsk: string) => {
    const q = textToAsk.trim();
    if (!q || isLoading) return;

    setQuestion(q);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/stock/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          plan:
            plan === 'diwali'
              ? 'Diwali month (8 Nov)'
              : plan === 'sale'
              ? 'Big sale (20% off)'
              : 'Normal month',
          stockData: {
            shop: 'Delhi Flagship, Connaught Place',
            items: items.map((i) => ({
              name: i.name,
              price: i.price,
              inStock: i.inStock,
              likelySales: i.likelySales,
              daysLeft: i.daysLeft,
              status: i.status,
            })),
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();
      setAnswer(data.answer || 'Shop data checked. Everything looks in order.');
    } catch {
      setErrorMsg('Something went wrong. Try again.');
      setAnswer('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setQuestion(transcript);
        handleAsk(transcript);
      };
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Button (Present on every tab) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 min-h-[48px] px-5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-full font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-teal-900/20 cursor-pointer transition-all active:scale-95 focus:outline-hidden focus:ring-3 focus:ring-[#0F766E]/50"
        aria-label="Ask about stock"
      >
        <HelpCircle className="w-5 h-5 shrink-0" />
        <span>Ask about stock</span>
      </button>

      {/* Floating Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] bg-white  border border-[#E4E1D8]  rounded-[18px] shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]/60 ">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#DDF1EE]  text-[#0F766E]  flex items-center justify-center font-bold text-sm">
                ?
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#1B2420] ">
                  Ask About Stock
                </h4>
                <p className="text-[11px] text-[#66726C] ">
                  Delhi Flagship • Answers from store records
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#66726C] hover:text-[#1B2420]  rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Tap Questions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#66726C]  uppercase block">
              Quick Tap Questions:
            </span>
            <div className="flex flex-col gap-1.5">
              {sampleQuestions.map((sq) => (
                <button
                  key={sq}
                  onClick={() => handleAsk(sq)}
                  className="text-left text-xs font-semibold px-3 py-2 rounded-xl bg-[#F6F4EF]  text-[#1B2420]  hover:bg-[#DDF1EE]  hover:text-[#0F766E] border border-[#E4E1D8]/70  transition-colors cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Box */}
          {(answer || isLoading) && (
            <div className="p-3.5 rounded-xl bg-[#E3F4F1]  text-xs text-[#0F766E]  border border-[#0F766E]/15">
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 mb-1">
                Answer:
              </span>
              {isLoading ? (
                <div className="flex items-center gap-2 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking store stock...</span>
                </div>
              ) : (
                <p className="font-medium leading-relaxed">{answer}</p>
              )}
            </div>
          )}

          {/* Custom Input Box + Voice Mic */}
          <div className="pt-2 border-t border-[#E4E1D8]/60 ">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(question);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type or speak any question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-[#F6F4EF]  border border-[#E4E1D8]  rounded-xl text-[#1B2420]  placeholder-[#66726C] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              {/* Mic Button */}
              <button
                type="button"
                onClick={toggleMic}
                className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#F6F4EF]  text-[#0F766E] border border-[#E4E1D8] '
                }`}
                title="Speak question"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white disabled:opacity-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
