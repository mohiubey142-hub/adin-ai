// src/components/founder/HeroSection.tsx
import { useState, useEffect } from "react";
import { MapPin, Calendar, X, ZoomIn } from "lucide-react";

export default function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // ✅ Body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ✅ Handle outside click (click on backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-slate-50 to-white">
        {/* Background Glow */}
        <div className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] bg-purple-300/25 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[550px] h-[550px] bg-blue-200/20 rounded-full blur-[140px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* ✅ Profile Photo - Clickable with Zoom Indicator */}
            <div className="flex-shrink-0">
              <div
                className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 p-1 shadow-xl shadow-purple-600/20 cursor-pointer group transition-transform duration-300 hover:scale-[1.02]"
                onClick={openModal}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/kian-mercer-profile.png"
                    alt="Kian Mercer, Founder of Adin AI"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {/* ✅ Zoom indicator overlay - appears on hover */}
                <div className="absolute inset-0 rounded-full bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/25 backdrop-blur-sm rounded-full p-2 sm:p-3">
                    <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
              {/* ✅ Subtle hint text */}
              <p
                className="text-[11px] text-slate-500 text-center mt-2 sm:mt-3 cursor-pointer hover:text-purple-600 transition-colors"
                onClick={openModal}
              >
                Click to view full size
              </p>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Kian{' '}
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  Mercer
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-purple-700 font-semibold mt-1">
                Founder &amp; CEO of Adin AI
              </p>

              <p className="text-sm md:text-base text-slate-600 mt-3 max-w-xl mx-auto md:mx-0">
                Building AI-powered career tools for students and freelancers.
                Pakistan's youngest AI product founder.
              </p>

              {/* Premium Badges */}
              <div className="flex flex-wrap gap-2.5 mt-5 justify-center md:justify-start">
                <span className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
                  16 Years Old
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                  Pakistan
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                  AI Product Builder
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
                  92% Matric
                </span>
              </div>

              {/* Location & Age */}
              <div className="flex flex-wrap gap-4 mt-5 text-xs text-slate-500 justify-center md:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-600" />
                  Mananwala, Sheikhupura, Pakistan
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-600" />
                  16 (17 in progress)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FULL-SCREEN IMAGE MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 sm:p-8"
          onClick={handleBackdropClick}
        >
          {/* ✅ Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white hover:scale-110"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* ✅ Image Container - with zoom/scroll support */}
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src="/kian-mercer-profile.png"
              alt="Kian Mercer, Founder of Adin AI - Full Size Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              loading="lazy"
            />
          </div>

          {/* ✅ Hint text for mobile */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-300 sm:text-sm">
            Pinch to zoom • Click outside or press ESC to close
          </p>
        </div>
      )}
    </>
  );
}
