import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import type { Language } from '../types';

interface Props {
  lang: Language;
}

export default function BackToTop({ lang }: Props) {
  const isAr = lang === 'ar';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 360);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          onClick={scrollToTop}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -2 }}
          aria-label={isAr ? 'العودة للأعلى' : 'Back to top'}
          title={isAr ? 'العودة للأعلى' : 'Back to top'}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] ltr:right-4 rtl:left-4 sm:bottom-6 sm:ltr:right-6 sm:rtl:left-6 md:bottom-8 md:ltr:right-8 md:rtl:left-8 z-40 flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#16191f]/90 text-[#15171c] dark:text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[#004ad7] dark:hover:border-[#3b82f6]"
        >
          <ArrowUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
