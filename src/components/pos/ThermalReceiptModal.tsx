import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Sale } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, Download, CheckCircle, X } from 'lucide-react';

interface ThermalReceiptModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const { currentBusiness, currentLocation } = useApp();
  const [eInvoiceQr, setEInvoiceQr] = useState<string>('');

  useEffect(() => {
    if (sale) {
      const eInvoicePayload = `GSTIN:${currentBusiness.gstin}|INV:${sale.invoiceNumber}|DATE:${sale.timestamp}|VAL:${sale.roundedTotal}`;
      QRCode.toDataURL(eInvoicePayload, { width: 120, margin: 1 })
        .then((url) => setEInvoiceQr(url))
        .catch(console.error);
    }
  }, [sale, currentBusiness.gstin]);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textReceipt = `
========================================
         ${currentBusiness.name}
  ${currentLocation.name}
  GSTIN: ${currentBusiness.gstin}
  Phone: ${currentBusiness.phone}
========================================
TAX INVOICE
Invoice No : ${sale.invoiceNumber}
Date & Time: ${new Date(sale.timestamp).toLocaleString('en-IN')}
Cashier    : ${sale.cashierName}
Customer   : ${sale.customerName || 'Walk-in'}
----------------------------------------
ITEM              HSN     QTY  RATE   AMOUNT
----------------------------------------
${sale.items
  .map(
    (i) =>
      `${i.productName.slice(0, 16).padEnd(16)} ${i.hsnCode}  ${i.quantity}   ₹${i.unitPrice}  ₹${i.lineTotal}`
  )
  .join('\n')}
----------------------------------------
Subtotal        : ₹${sale.subtotal.toFixed(2)}
Discount        : ₹${sale.discountTotal.toFixed(2)}
CGST            : ₹${sale.cgstTotal.toFixed(2)}
SGST            : ₹${sale.sgstTotal.toFixed(2)}
Round Off       : ₹${sale.roundingDelta.toFixed(2)}
----------------------------------------
GRAND TOTAL     : ₹${sale.roundedTotal.toLocaleString('en-IN')}
----------------------------------------
Tenders:
${sale.payments.map((p) => `${p.type.toUpperCase()}: ₹${p.amount} ${p.reference ? '(' + p.reference + ')' : ''}`).join('\n')}
========================================
    Thank you for shopping with us!
   GST compliant electronic receipt
========================================
    `;

    const blob = new Blob([textReceipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sale.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Top Control Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Sale Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print (ESC/POS)</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Download Receipt TXT"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container (80mm width standard) */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt"
            className="w-[320px] bg-white p-5 shadow-md border border-slate-300 font-mono text-[11px] leading-relaxed text-slate-900 select-text"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <div className="font-bold text-sm text-slate-950 uppercase">{currentBusiness.name}</div>
              <div className="text-[10px] text-slate-600">{currentLocation.name}</div>
              <div className="text-[10px] text-slate-600">{currentBusiness.address}</div>
              <div className="text-[10px] text-slate-700 font-bold mt-1">GSTIN: {currentBusiness.gstin}</div>
              <div className="text-[10px] text-slate-600">Ph: {currentBusiness.phone}</div>
            </div>

            {/* Invoice Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date/Time:</span>
                <span>{new Date(sale.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>
              {sale.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span>{sale.customerName} ({sale.customerPhone || 'N/A'})</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-slate-300">
                <span>ITEM</span>
                <span>QTY x RATE</span>
                <span>TOTAL</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="text-[10px]">
                    <div className="font-semibold text-slate-950 truncate">{item.productName}</div>
                    <div className="flex justify-between text-slate-600 text-[9px]">
                      <span>HSN: {item.hsnCode} (GST {item.taxRate}%)</span>
                      <span>{item.quantity} x ₹{item.unitPrice}</span>
                      <span className="font-bold text-slate-900">₹{item.lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span>₹{sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{sale.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (Central Tax):</span>
                <span>₹{sale.cgstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (State Tax):</span>
                <span>₹{sale.sgstTotal.toFixed(2)}</span>
              </div>
              {sale.roundingDelta !== 0 && (
                <div className="flex justify-between text-slate-500 text-[9px]">
                  <span>Round Off:</span>
                  <span>₹{sale.roundingDelta.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-xs text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL PAYABLE:</span>
                <span>₹{sale.roundedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="font-bold text-[9px] uppercase text-slate-500">Payment Breakdown:</div>
              {sale.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="capitalize">{p.type} {p.reference ? `(${p.reference.slice(-6)})` : ''}</span>
                  <span className="font-semibold">₹{p.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* QR Code and Footer */}
            <div className="pt-3 text-center flex flex-col items-center">
              {eInvoiceQr && (
                <img src={eInvoiceQr} alt="e-Invoice Verification" className="w-20 h-20 mb-1" />
              )}
              <div className="text-[9px] text-slate-500 font-sans">
                Scan for digital tax invoice verification
              </div>
              <div className="text-[10px] font-bold mt-2">*** THANK YOU FOR VISITING ***</div>
              <div className="text-[8px] text-slate-400 mt-0.5">Items once sold can be returned within 7 days with original receipt.</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Start New Transaction (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
