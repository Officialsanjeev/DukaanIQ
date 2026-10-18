import React, { useState } from 'react';
import { PlanScenario } from './types';
import { Phone, MessageSquare, Clock, Star, ShieldCheck, Check, Truck } from 'lucide-react';

interface TabSuppliersProps {
  plan: PlanScenario;
}

interface SupplierCardData {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  categories: string[];
  onTimeRate: number;
  deliveryDays: number;
  openBalance: number;
  rating: number;
  recentOrdersCount: number;
}

const SUPPLIER_DATA: SupplierCardData[] = [
  {
    id: 'sup-1',
    name: 'TechSupply India Ltd',
    location: 'Noida Hub, UP',
    contactPerson: 'Ramesh Kulkarni',
    phone: '+91 98201 11223',
    categories: ['Audio', 'Headphones', 'Cables'],
    onTimeRate: 98,
    deliveryDays: 2.4,
    openBalance: 42000,
    rating: 4.9,
    recentOrdersCount: 14,
  },
  {
    id: 'sup-2',
    name: 'VoltPower Components',
    location: 'Gurugram Udyog Vihar',
    contactPerson: 'Sunil Aggarwal',
    phone: '+91 98103 44556',
    categories: ['Fast Chargers', 'Power Banks'],
    onTimeRate: 94,
    deliveryDays: 3.1,
    openBalance: 18500,
    rating: 4.7,
    recentOrdersCount: 9,
  },
  {
    id: 'sup-3',
    name: 'NexDevice Smartphone Distribution',
    location: 'Okhla Phase-3, Delhi',
    contactPerson: 'Priyanka Sen',
    phone: '+91 97118 66220',
    categories: ['Flagship Smartphones', 'Tablets'],
    onTimeRate: 91,
    deliveryDays: 4.2,
    openBalance: 165000,
    rating: 4.5,
    recentOrdersCount: 6,
  },
  {
    id: 'sup-4',
    name: 'CrystalShield Optics & Protection',
    location: 'Ahmedabad Distribution Hub',
    contactPerson: 'Devendra Singhania',
    phone: '+91 99302 77889',
    categories: ['Screen Guards', 'Protective Cases'],
    onTimeRate: 99,
    deliveryDays: 1.8,
    openBalance: 8400,
    rating: 4.9,
    recentOrdersCount: 18,
  },
];

export const TabSuppliers: React.FC<TabSuppliersProps> = ({ plan }) => {
  const [copiedSupplierPhone, setCopiedSupplierPhone] = useState<string | null>(null);

  const handleCopyPhone = (sup: SupplierCardData) => {
    navigator.clipboard.writeText(sup.phone);
    setCopiedSupplierPhone(sup.id);
    setTimeout(() => setCopiedSupplierPhone(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1B2420] ">
            Suppliers & Delivery Times
          </h2>
          <p className="text-sm text-[#66726C]  mt-0.5">
            Who delivers on time and cheapest? Check lead times, vendor ratings, and open payment balances.
          </p>
        </div>

        {/* Highlight Note */}
        <div className="bg-[#E3F4F1]  px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#0F766E] ">
          Average Delivery Across Suppliers: <span className="font-extrabold text-[#1B2420] ">2.8 days</span>
        </div>
      </div>

      {/* AI Supplier Advice Strip */}
      <div className="bg-[#DDF1EE]  border border-[#0F766E]/20 rounded-[18px] p-4 text-xs sm:text-sm text-[#0F766E]  shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-bold">
          <Truck className="w-5 h-5 text-[#0F766E] shrink-0" />
          <span>
            {plan === 'diwali'
              ? 'Diwali Advice: NexDevice takes 4.2 days for phones. Place festive orders 3 days earlier before transport jams on Diwali week.'
              : 'Delivery Advice: TechSupply India delivers fastest (2.4 days). VoltPower is 94% on-time. Both have reliable stock right now.'}
          </span>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SUPPLIER_DATA.map((sup) => (
          <div
            key={sup.id}
            className="bg-white  border border-[#E4E1D8]  rounded-[18px] p-6 shadow-xs flex flex-col justify-between space-y-5"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E4E1D8]/60 ">
                <div>
                  <h3 className="font-bold text-[16px] text-[#1B2420]  leading-tight">
                    {sup.name}
                  </h3>
                  <p className="text-xs text-[#66726C]  mt-0.5">
                    {sup.location} • Contact: {sup.contactPerson}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#FFF4CC] px-2.5 py-1 rounded-full text-xs font-bold text-[#B45309]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{sup.rating}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-4 bg-[#F6F4EF]  p-3 rounded-xl border border-[#E4E1D8]/60  text-center">
                <div>
                  <span className="text-[10px] text-[#66726C]  font-bold block uppercase">
                    On-time
                  </span>
                  <span className="text-lg font-extrabold text-[#15803D]">
                    {sup.onTimeRate}%
                  </span>
                </div>
                <div className="border-x border-[#E4E1D8] ">
                  <span className="text-[10px] text-[#66726C]  font-bold block uppercase">
                    Lead time
                  </span>
                  <span className="text-lg font-extrabold text-[#0F766E]">
                    {sup.deliveryDays} d
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#66726C]  font-bold block uppercase">
                    Balance due
                  </span>
                  <span className="text-sm font-extrabold text-[#1B2420]  truncate block">
                    Rs {sup.openBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Categories Supplied */}
              <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-[#66726C]  font-semibold mr-1">
                  Supplies:
                </span>
                {sup.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F6F4EF]  text-[#1B2420]  border border-[#E4E1D8]/60 "
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E4E1D8]/60  flex items-center gap-3">
              <button
                onClick={() => handleCopyPhone(sup)}
                className="flex-1 min-h-[44px] bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-[12px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
              >
                {copiedSupplierPhone === sup.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Phone Copied!</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ({sup.phone})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const text = `Namaste ${sup.contactPerson} ji, Delhi Flagship store se hume naya stock requirement check karna hai. Kripya available dispatch slots batayein.`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="min-h-[44px] px-4 bg-white  border border-[#E4E1D8]  hover:bg-[#F6F4EF]  text-[#1B2420]  rounded-[12px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
