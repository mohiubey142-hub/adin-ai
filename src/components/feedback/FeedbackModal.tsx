// src/components/feedback/FeedbackModal.tsx
// ✅ UPDATED: Dispatch event on feedback completion → triggers PIN education popup in App.tsx

import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Minimize2 } from 'lucide-react';
import StarRating from './StarRating';
import {
  submitFeedback,
  markFeedbackCompleted,
  markFeedbackShown,
} from '../../services/feedbackService';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  source: 'cv-builder' | 'cover-letter';
  sourceKey: string;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onMinimize,
  source,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [errors, setErrors] = useState<{ rating?: string; email?: string; message?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setName('');
      setEmail('');
      setMessage('');
      setIsSuccess(false);
      setIsSubmitting(false);
      setIsClosing(false);
      setErrors({});
      markFeedbackShown(source);
    }
  }, [isOpen, source]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleMaybeLater = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      handleClose();
      toast.success("We'll check in later!", { icon: '👋', duration: 3000 });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { rating?: string; email?: string; message?: string } = {};
    if (rating === 0) newErrors.rating = 'Please rate your experience';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`feedback-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setIsSubmitting(true);
    const result = await submitFeedback({
      rating,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      source,
      timestamp: new Date().toISOString(),
    });
    setIsSubmitting(false);

    if (result.success) {
      markFeedbackCompleted(source);
      setIsSuccess(true);

      // ✅ NEW: Notify App.tsx to re-check PIN education popup
      window.dispatchEvent(new CustomEvent('adin-feedback-completed'));

      setTimeout(() => handleClose(), 3000);
    } else {
      toast.error(result.message || 'Failed to submit. Please try again.');
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleMaybeLater}
    >
      <div
        className={`relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close / Minimize Button */}
        <button
          onClick={handleMaybeLater}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all duration-300 hover:scale-110 group z-10"
          aria-label="Minimize to widget"
        >
          <Minimize2 size={16} className="text-slate-500 group-hover:text-slate-800 transition-colors" />
        </button>

        <div className="p-4 sm:p-5 md:p-6">
          {isSuccess ? (
            <div className="text-center py-4 sm:py-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 flex items-center justify-center mx-auto mb-3 animate-bounce">
                <CheckCircle size={26} className="text-emerald-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                Thank You! 🎉
              </h3>
              <p className="text-sm text-slate-600">
                Your feedback has been submitted successfully.
              </p>
              <p className="text-xs text-slate-400 mt-1.5">We read every feedback personally.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-3 sm:mb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md shadow-purple-500/25">
                    <img
                      src="/icon-192x192.png"
                      alt="Adin AI"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Share Your Feedback
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help us make Adin AI better.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                <div id="feedback-rating" className="text-center">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    How would you rate your experience? <span className="text-red-500">*</span>
                  </label>
                  <StarRating
                    rating={rating}
                    onRatingChange={(r) => {
                      setRating(r);
                      if (errors.rating) setErrors(prev => ({ ...prev, rating: undefined }));
                    }}
                    size="md"
                  />
                  {rating > 0 && (
                    <p className="text-xs text-purple-600 mt-1">
                      {rating === 5 && '⭐ Excellent!'}
                      {rating === 4 && '👍 Great!'}
                      {rating === 3 && '😊 Pretty good!'}
                      {rating === 2 && '🤔 Could be better'}
                      {rating === 1 && '😟 Sorry to hear that'}
                    </p>
                  )}
                  {errors.rating && (
                    <p className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1">
                      <AlertCircle size={12} />
                      {errors.rating}
                    </p>
                  )}
                </div>

                <div id="feedback-message">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    What can we improve? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Share your thoughts..."
                    rows={2}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 border ${
                      errors.message
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 focus:border-purple-500'
                    } text-slate-900 placeholder-slate-400 focus:ring-2 ${
                      errors.message ? 'focus:ring-red-500/20' : 'focus:ring-purple-500/20'
                    } outline-none transition-all duration-300 text-sm resize-none`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.message}
                    </p>
                  )}
                </div>

                <div id="feedback-email">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-50 border ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-slate-200 focus:border-purple-500'
                    } text-slate-900 placeholder-slate-400 focus:ring-2 ${
                      errors.email ? 'focus:ring-red-500/20' : 'focus:ring-purple-500/20'
                    } outline-none transition-all duration-300 text-sm`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Your Name <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kian Mercer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300 text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleMaybeLater}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all duration-300 hover:scale-[1.02] order-2 sm:order-1 flex items-center justify-center gap-1"
                  >
                    <Minimize2 size={14} />
                    Maybe Later
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${
                      isSubmitting ? 'opacity-70' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-1">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}