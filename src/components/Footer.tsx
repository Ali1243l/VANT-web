import { useRef } from 'react';
import type { Language } from '../types';
import { useSiteControls } from '../context/SiteControlsContext';
import SocialIconRenderer from './SocialIconRenderer';

interface Props {
  lang: Language;
  isLiveDatabase: boolean;
  onAdminTrigger?: () => void;
}

export default function Footer({ lang, onAdminTrigger }: Props) {
  const isAr = lang === 'ar';
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { socialLinks } = useSiteControls();

  const handleCopyrightClick = () => {
    if (!onAdminTrigger) return;

    // Start 5-second countdown on the very first tap
    if (tapCountRef.current === 0) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 5000);
    }

    tapCountRef.current += 1;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      onAdminTrigger();
    }
  };

  const activeLinks = (socialLinks || []).filter((l) => l.isActive !== false);

  return (
    <footer className="mt-auto border-t border-black/5 dark:border-white/10 pt-6 pb-8 text-center text-xs text-[#6b7280] dark:text-[#9ca3af]">
      <div className="mx-auto max-w-[1920px] w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Social Accounts Showcase - Ergonomic Capsule Row for Mobile & Desktop (CSS Selector 1) */}
        {activeLinks.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 pb-5 mb-5 border-b border-black/5 dark:border-white/8 text-xs"
            aria-label={isAr ? 'حسابات ومنصات التواصل والتوثيق الرسمية' : 'Official Social & Platform Profiles'}
          >
            {activeLinks.map((social, index) => (
              <div key={social.id} className="flex items-center gap-2 sm:gap-3.5">
                <a
                  href={social.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[#15171c]/75 dark:text-white/75 hover:text-[#004ad7] dark:hover:text-[#3b82f6] hover:border-[#004ad7]/30 dark:hover:border-[#3b82f6]/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] active:scale-95 transition-all shadow-2xs"
                  title={`${social.name}: ${social.handle || social.name}`}
                >
                  <span className="flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center text-[#15171c]/80 dark:text-white/80 group-hover:text-[#004ad7] dark:group-hover:text-[#3b82f6] transition-colors">
                    <SocialIconRenderer iconName={social.iconName} customSvg={social.customIconSvg} />
                  </span>
                  <span className="font-mono text-[11px] sm:text-[11.5px] tracking-tight direction-ltr">
                    {social.handle || social.name}
                  </span>
                </a>

                {/* Minimalist divider shown on larger screens */}
                {index < activeLinks.length - 1 && (
                  <span className="hidden sm:inline select-none text-black/20 dark:text-white/20 text-xs" aria-hidden="true">
                    ·
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lower row: Centered Copyright for both desktop and mobile (CSS Selector 2) */}
        <div className="flex items-center justify-center text-center text-xs">
          <p
            onClick={handleCopyrightClick}
            className="tracking-wide select-none cursor-default outline-none [-webkit-tap-highlight-color:transparent] text-center mx-auto text-[#6b7280] dark:text-[#9ca3af]"
          >
            {isAr ? 'ڤانت · كتالوج الأزياء الحصري © 2026' : 'VANT · Capsule Lookbook © 2026'}
          </p>
        </div>
      </div>
    </footer>
  );
}
