// src/components/feedback/FeedbackModal.tsx
import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, Minimize2 } from 'lucide-react';
import StarRating from './StarRating';
import { 
  submitFeedback, 
  markFeedbackCompleted, 
  markFeedbackShown,
  markFeedbackSkipped,
  shouldShowFeedback 
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
  sourceKey 
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
      toast.success('We\'ll check in later!', {
        icon: '👋',
        duration: 3000,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { rating?: string; email?: string; message?: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please rate your experience';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    }

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
      setTimeout(() => {
        handleClose();
      }, 3000);
    } else {
      toast.error(result.message || 'Failed to submit. Please try again.');
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleMaybeLater}
      >
        {/* Modal */}
        <div
          className={`relative w-full max-w-md bg-gradient-to-br from-[#0a0a12] to-[#111122] border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleMaybeLater}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-110 group"
            aria-label="Minimize to widget"
          >
            <Minimize2 size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          </button>

          {/* Content */}
          <div className="p-5 sm:p-6 md:p-8">
            {isSuccess ? (
              // Success State
              <div className="text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Thank You! 🎉</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Your feedback has been submitted successfully.
                </p>
                <p className="text-xs text-gray-500 mt-2">We read every feedback personally.</p>
              </div>
            ) : (
              // Form State
              <>
                {/* ✅ Header - Adin AI Logo Top Center (No Sparkles) */}
                <div className="text-center mb-5 sm:mb-6">
                  <div className="flex justify-center mb-3">
                    <img
                      src="/icon-192x192.png"
                      alt="Adin AI"
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl bg-gradient-to-br from-purple-600/10 to-blue-500/10 p-1 border border-purple-500/20"
                    />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Share Your Feedback
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Help us make Adin AI better for everyone.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Rating */}
                  <div id="feedback-rating" className="text-center">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How would you rate your experience? <span className="text-red-400">*</span>
                    </label>
                    <StarRating
                      rating={rating}
                      onRatingChange={(r) => {
                        setRating(r);
                        if (errors.rating) {
                          setErrors(prev => ({ ...prev, rating: undefined }));
                        }
                      }}
                      size="lg"
                    />
                    {rating > 0 && (
                      <p className="text-xs text-purple-400 mt-1.5">
                        {rating === 5 && '⭐ Excellent! Made my day!'}
                        {rating === 4 && '👍 Great experience!'}
                        {rating === 3 && '😊 Pretty good!'}
                        {rating === 2 && '🤔 Could be better'}
                        {rating === 1 && '😟 Sorry to hear that'}
                      </p>
                    )}
                    {errors.rating && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center justify-center gap-1">
                        <AlertCircle size={12} />
                        {errors.rating}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div id="feedback-message">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      What can we improve? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) {
                          setErrors(prev => ({ ...prev, message: undefined }));
                        }
                      }}
                      placeholder="Share your thoughts, suggestions, or issues..."
                      rows={3}
                      className={`w-full px-3 sm:px-4 py-2.5 rounded-xl bg-gray-800/60 border ${
                        errors.message ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-purple-500'
                      } text-white placeholder-gray-500 focus:ring-2 ${
                        errors.message ? 'focus:ring-red-500/30' : 'focus:ring-purple-500/30'
                      } outline-none transition-all duration-300 text-sm sm:text-base resize-none`}
                      required
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1 text-right">
                      {message.length} characters
                    </p>
                  </div>

                  {/* Email */}
                  <div id="feedback-email">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors(prev => ({ ...prev, email: undefined }));
                        }
                      }}
                      placeholder="you@example.com"
                      className={`w-full px-3 sm:px-4 py-2 rounded-xl bg-gray-800/60 border ${
                        errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-purple-500'
                      } text-white placeholder-gray-500 focus:ring-2 ${
                        errors.email ? 'focus:ring-red-500/30' : 'focus:ring-purple-500/30'
                      } outline-none transition-all duration-300 text-sm`}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Your Name <span className="text-gray-600">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Kian Mercer"
                      className="w-full px-3 sm:px-4 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 text-sm"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleMaybeLater}
                      className="px-4 py-2.5 rounded-xl bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 text-sm font-medium transition-all duration-300 hover:scale-[1.02] order-2 sm:order-1 flex items-center justify-center gap-1"
                    >
                      <Minimize2 size={14} />
                      Maybe Later
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-sm font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${
                        isSubmitting ? 'opacity-70' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 text-center mt-2">
                    <span className="text-red-400">*</span> Required fields
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}