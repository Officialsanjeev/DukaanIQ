import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DukaanIqLogo } from './DukaanIqLogo';
import { ArrowLeft, CheckCircle2, Send, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  comment: string;
  timestamp: string;
}

export const ContactUsPage: React.FC = () => {
  const { setActiveView } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [comment, setComment] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = contactNo.replace(/\D/g, '');
    if (!contactNo.trim()) {
      newErrors.contactNo = 'Please enter your contact number';
    } else if (cleanPhone.length < 10) {
      newErrors.contactNo = 'Please enter a valid 10-digit mobile number';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please enter your message or question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);

    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      contactNo: contactNo.trim(),
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    // Save submissions locally
    try {
      const existingStr = localStorage.getItem('dukaaniq_contact_submissions');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('dukaaniq_contact_submissions', JSON.stringify([submission, ...existing]));
    } catch (err) {
      console.warn('Could not save to localStorage', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setContactNo('');
    setComment('');
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9]  text-[#101828]  font-sans">
      {/* Top Navigation */}
      <nav className="h-16 bg-white  border-b border-[#E8EBF2]  px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div
          onClick={() => setActiveView('home')}
          className="cursor-pointer"
        >
          <DukaanIqLogo size="sm" />
        </div>

        <button
          onClick={() => setActiveView('home')}
          className="h-9 px-3.5 rounded-[10px] bg-[#F2F4F7]  hover:bg-[#E8EBF2] text-[#101828]  text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </nav>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[12px] font-bold text-[#2563EB] uppercase tracking-wider">
            Contact Us
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] ">
            We are here to help your shop grow
          </h1>
          <p className="text-sm text-[#667085]  max-w-lg mx-auto">
            Have questions about DukaanIQ billing, GST or hardware setup? Send us a message and our team will get back to you quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info */}
          <div className="md:col-span-5 bg-white  border border-[#E8EBF2]  rounded-[16px] p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-[#101828] ">
              Delhi Flagship Office
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828]  block">
                    Address
                  </span>
                  <span className="text-[#667085] ">
                    Block B-12, Connaught Circus, Connaught Place, New Delhi 110001
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#12A150] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828]  block">
                    Phone & WhatsApp
                  </span>
                  <span className="text-[#667085] ">
                    +91 98110 24580 (Mon to Sat, 9 AM to 8 PM)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#101828]  block">
                    Support Email
                  </span>
                  <span className="text-[#667085] ">
                    support@dukaaniq.in
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8EBF2]  text-xs text-[#667085] ">
              Quick assistance for barcode scanners, thermal printers, and GST billing migration.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7 bg-white  border border-[#E8EBF2]  rounded-[16px] p-6 sm:p-8 shadow-xs">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E6F6EC] text-[#12A150] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#101828] ">
                  Thank You!
                </h3>
                <p className="text-sm text-[#667085]  max-w-sm mx-auto">
                  We received your message, <span className="font-semibold text-[#101828] ">{name}</span>. Our Delhi retail team will call or message you on <span className="font-semibold text-[#101828] ">{contactNo}</span> within 24 hours.
                </p>
                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="h-10 px-5 bg-[#F2F4F7] hover:bg-[#E8EBF2] text-[#101828] text-xs font-semibold rounded-[10px] cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <button
                    onClick={() => setActiveView('home')}
                    className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[10px] cursor-pointer shadow-xs"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#101828]  mb-1">
                    Name <span className="text-[#E5484D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    placeholder="Your full name"
                    className={`w-full h-10 px-3.5 bg-[#F9FAFB]  border rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40 ${
                      errors.name ? 'border-[#E5484D]' : 'border-[#E8EBF2] '
                    }`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-[#E5484D] mt-1 block">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#101828]  mb-1">
                      Email <span className="text-[#E5484D]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="name@store.in"
                      className={`w-full h-10 px-3.5 bg-[#F9FAFB]  border rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40 ${
                        errors.email ? 'border-[#E5484D]' : 'border-[#E8EBF2] '
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[11px] text-[#E5484D] mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#101828]  mb-1">
                      Contact No <span className="text-[#E5484D]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={contactNo}
                      onChange={(e) => {
                        setContactNo(e.target.value);
                        if (errors.contactNo) setErrors({ ...errors, contactNo: '' });
                      }}
                      placeholder="10-digit mobile number"
                      className={`w-full h-10 px-3.5 bg-[#F9FAFB]  border rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40 ${
                        errors.contactNo ? 'border-[#E5484D]' : 'border-[#E8EBF2] '
                      }`}
                    />
                    {errors.contactNo && (
                      <span className="text-[11px] text-[#E5484D] mt-1 block">
                        {errors.contactNo}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#101828]  mb-1">
                    Comment <span className="text-[#E5484D]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (errors.comment) setErrors({ ...errors, comment: '' });
                    }}
                    placeholder="Tell us what your retail shop needs or ask any question..."
                    className={`w-full p-3.5 bg-[#F9FAFB]  border rounded-[10px] text-xs text-[#101828]  placeholder-[#98A2B3] focus:bg-white  focus:outline-hidden focus:border-[#2563EB] focus:ring-2 focus:ring-[#93B4FA]/40 ${
                      errors.comment ? 'border-[#E5484D]' : 'border-[#E8EBF2] '
                    }`}
                  />
                  {errors.comment && (
                    <span className="text-[11px] text-[#E5484D] mt-1 block">
                      {errors.comment}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[40px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] active:scale-[0.98] disabled:opacity-50 text-white font-medium text-xs rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all focus:outline-hidden focus:ring-3 focus:ring-[#93B4FA]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
