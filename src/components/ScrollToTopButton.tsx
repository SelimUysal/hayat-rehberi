import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  threshold = 280,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      id="btn-scroll-to-top"
      onClick={scrollToTop}
      aria-label="Sayfanın Başına Çık"
      title="Sayfanın Başına Çık"
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-3.5 rounded-full bg-emerald-800/90 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl border border-emerald-500/40 backdrop-blur-md transition-all duration-300 transform active:scale-95 flex items-center justify-center cursor-pointer animate-in fade-in slide-in-from-bottom-4 group ${className}`}
    >
      <ArrowUp className="w-5 h-5 sm:w-5 sm:h-5 text-amber-300 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
