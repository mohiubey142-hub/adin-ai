// src/pages/NotFound.tsx
import { SEOHead } from "../components/SEO/SEOHead";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  // ✅ Go back to workspace
  const goBack = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <>
      {/* ✅ SEO for 404 Page */}
      <SEOHead
        title="Page Not Found - Adin AI"
        description="The page you're looking for doesn't exist. Return to Adin AI's home page to continue building your career with our AI-powered platform."
        canonicalUrl="https://adin-ai.com/404"
        ogType="website"
        noIndex={true}
      />

      {/* ✅ Page Content */}
      <div className="h-screen bg-black text-white overflow-y-auto">
        {/* Navigation - Sticky top */}
        <div className="sticky top-0 z-50 h-[56px] flex items-center px-5 border-b border-zinc-900 bg-black/90 backdrop-blur-md">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Back to Home</span>
          </button>
        </div>

        {/* 404 Content */}
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number */}
            <div className="relative inline-block">
              <div className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                404
              </div>
              <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-full -z-10" />
            </div>

            {/* Icon */}
            <div className="flex justify-center mt-6">
              <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Compass size={48} className="text-purple-400" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-6">
              Oops! Page Not Found
            </h1>

            {/* Description */}
            <p className="text-gray-400 mt-3 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            {/* Back to Home Button */}
            <button
              onClick={goBack}
              className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium flex items-center justify-center gap-2 mx-auto transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}