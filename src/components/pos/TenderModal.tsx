import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { TenderPayment, Sale } from '../../types';
import { QrCode, Banknote, CreditCard, Layers, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface TenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

export const TenderModal: React.FC<TenderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { calculateCartTotals, finalizeSale, currentBusiness, currentLocation } = useApp();
  const totals = calculateCartTotals();

  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'card' | 'split'>('upi');
  const [tenderedCash, setTenderedCash] = useState<number>(totals.roundedTotal);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [cardRef, setCardRef] = useState<string>('TXN' + Math.floor(100000 + Math.random() * 900000));
  const [splitCash, setSplitCash] = useState<number>(Math.floor(totals.roundedTotal / 2));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Generate UPI QR Code
  useEffect(() => {
    if (isOpen && totals.roundedTotal > 0) {
      setTenderedCash(totals.roundedTotal);
      setSplitCash(Math.floor(totals.roundedTotal / 2));
      const upiUri = `upi://pay?pa=apexretail@icici&pn=${encodeURIComponent(
        currentBusiness.name
      )}&am=${totals.roundedTotal}&cu=INR&tn=Invoice Payment`;

      QRCode.toDataURL(upiUri, { width: 220, margin: 1 })
        .then((url) => setUpiQrUrl(url))
        .catch((err) => console.error('QR Gen error', err));
    }
  }, [isOpen, totals.roundedTotal, currentBusiness.name]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, tenderedCash - totals.roundedTotal);
  const splitDigital = Math.max(0, totals.roundedTotal - splitCash);

  const isCashInsufficient = paymentMode === 'cash' && tenderedCash < totals.roundedTotal;
  const isSplitInvalid = paymentMode === 'split' && (splitCash < 0 || splitCash > totals.roundedTotal);
  const isInvalid = isCashInsufficient || isSplitInvalid;

  const handleConfirmSale = async () => {
    if (isInvalid) return;
    setIsProcessing(true);
    let payments: TenderPayment[] = [];

    if (paymentMode === 'upi') {
      payments = [
        {
          type: 'upi',
          amount: totals.roundedTotal,
          reference: 'UPI-SIM-' + Date.now().toString().slice(-6),
        },
      ];
    } else if (paymentMode === 'cash') {
      payments = [
        {
          type: 'cash',
          amount: totals.roundedTotal,
          tenderedCash,
          changeDue,
        },
      ];
    } else if (paymentMode === 'card') {
      payments = [
        {
          type: 'card',
          amount: totals.roundedTotal,
          reference: cardRef || 'CARD-EDC-' + Date.now().toString().slice(-6),
        },
      ];
    } else if (paymentMode === 'split') {
      payments = [
        {
          type: 'cash',
          amount: splitCash,
          tenderedCash: splitCash,
          changeDue: 0,
        },
        {
          type: 'upi',
          amount: splitDigital,
          reference: 'SPLIT-UPI-' + Date.now().toString().slice(-6),
        },
      ];
    }

    try {
      const finalizedSale = await finalizeSale(payments);
      setIsProcessing(false);
      onSuccess(finalizedSale);
    } catch (error) {
      console.error('Finalize error', error);
      setIsProcessing(false);
    }
  };

  const addCashPreset = (amount: number) => {
    setTenderedCash((prev) => prev + amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {currentLocation.name}
            </div>
            <div className="text-lg font-bold">Collect Payment & Settle</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary Banner */}
        <div className="px-6 py-3.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-blue-700">Total Payable Amount</span>
            <div className="text-2xl font-extrabold text-blue-950 font-mono tabular-nums">
              ₹{totals.roundedTotal.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right text-xs text-blue-800">
            <div>Subtotal: ₹{totals.subtotal.toLocaleString('en-IN')}</div>
            <div>GST: ₹{totals.taxTotal.toLocaleString('en-IN')} (CGST+SGST)</div>
          </div>
        </div>

        {/* Tender Mode Selector Tabs */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button
              onClick={() => setPaymentMode('upi')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                paymentMode === 'upi'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>UPI QR</span>
            </button>
            <button
              onClick={() => setPaymentMode('cash')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                paymentMode === 'cash'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span>Cash</span>
            </button>
            <button
              onClick={() => setPaymentMode('card')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                paymentMode === 'card'
                  ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs ring-1 ring-purple-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span>Card</span>
            </button>
            <button
              onClick={() => setPaymentMode('split')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                paymentMode === 'split'
                  ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-xs ring-1 ring-amber-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Split</span>
            </button>
          </div>

          {/* UPI Mode View */}
          {paymentMode === 'upi' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              {upiQrUrl ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <img src={upiQrUrl} alt="UPI Dynamic QR" className="w-44 h-44" />
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-xl" />
              )}
              <div className="mt-3 text-center">
                <div className="text-xs font-bold text-slate-800">Scan with any UPI App</div>
                <div className="text-[11px] text-slate-500 font-mono">GPay · PhonePe · Paytm · BHIM</div>
                <div className="text-xs text-blue-700 font-semibold mt-1">VPA: apexretail@icici</div>
              </div>
            </div>
          )}

          {/* Cash Mode View */}
          {paymentMode === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Tendered by Customer (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={tenderedCash}
                    onChange={(e) => setTenderedCash(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-lg font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Quick Add:</span>
                {[500, 200, 100, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addCashPreset(amt)}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    +₹{amt}
                  </button>
                ))}
                <button
                  onClick={() => setTenderedCash(totals.roundedTotal)}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md transition-colors ml-auto cursor-pointer"
                >
                  Exact
                </button>
              </div>

              {/* Change / Shortage calculation */}
              {isCashInsufficient ? (
                <div className="p-3 rounded-xl border bg-rose-50 border-rose-200 text-rose-900 flex items-center justify-between">
                  <span className="text-xs font-bold">Shortage / Still Due:</span>
                  <span className="text-xl font-bold font-mono text-rose-700">
                    ₹{(totals.roundedTotal - tenderedCash).toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    changeDue > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-semibold">Change to Return to Customer:</span>
                  <span className="text-xl font-bold font-mono">
                    ₹{changeDue.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Card Mode View */}
          {paymentMode === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Swipe/Dip on Card POS Terminal
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Please swipe the customer's Credit/Debit card on the EDC machine and enter the transaction reference code.
                </p>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  EDC Reference / Approval Code
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. TXN987214"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Split Mode View */}
          {paymentMode === 'split' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cash Portion (₹)
                </label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-900">
                <span className="text-xs font-semibold">Balance via UPI / Card:</span>
                <span className="text-lg font-bold font-mono">
                  ₹{splitDigital.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel / Back to Cart
          </button>
          <button
            onClick={handleConfirmSale}
            disabled={isProcessing || isInvalid}
            className="px-6 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <span>Finalizing Transaction...</span>
            ) : isInvalid ? (
              <span>Enter Valid Amount</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Generate Tax Invoice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
