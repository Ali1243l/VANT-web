interface Props {
  aspectRatioClass?: string;
  index?: number;
}

export default function SkeletonCard({
  aspectRatioClass = 'aspect-[3/4]',
  index = 0,
}: Props) {
  // Stagger animation delay slightly across columns for a natural editorial cascade
  const staggerDelay = `${(index % 4) * 0.15}s`;

  return (
    <div
      className="group relative mb-3 sm:mb-4 overflow-hidden rounded-2xl border border-black/6 dark:border-white/10 bg-white/80 dark:bg-[#15171e]/90 p-2 sm:p-2.5 shadow-2xs backdrop-blur-xs select-none"
      style={{ animationDelay: staggerDelay }}
    >
      {/* Image Skeleton Box with High-Fidelity Angled Shimmer Sweep */}
      <div
        className={`relative overflow-hidden rounded-xl bg-neutral-200/80 dark:bg-neutral-800/60 ${aspectRatioClass}`}
      >
        {/* Shimmer sweeping beam */}
        <div
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 dark:via-white/12 to-transparent pointer-events-none"
          style={{ animationDelay: staggerDelay }}
        />

        {/* Ambient watermark icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-10 pointer-events-none">
          <svg className="w-10 h-10 stroke-[1.2] text-neutral-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>

        {/* Wishlist Circle Button Skeleton */}
        <div className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 z-10 h-7 w-7 rounded-full bg-neutral-300/80 dark:bg-white/10 border border-black/5 dark:border-white/10" />

        {/* Bottom subtle gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 dark:from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Typography & Meta Skeleton Placeholders */}
      <div className="mt-3 px-1 space-y-2">
        {/* Category & Status tag row */}
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 rounded-full bg-neutral-200 dark:bg-white/10" />
          <div className="h-2 w-10 rounded-full bg-neutral-200/70 dark:bg-white/5" />
        </div>

        {/* Title placeholder (primary line) */}
        <div className="h-3.5 w-4/5 rounded-md bg-neutral-300/80 dark:bg-white/15" />

        {/* Subtitle / Arabic title line */}
        <div className="h-2.5 w-3/5 rounded-md bg-neutral-200/80 dark:bg-white/10" />

        {/* Price & Fabric pill row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-black/4 dark:border-white/6">
          <div className="h-4 w-20 rounded-md bg-neutral-300 dark:bg-white/20" />
          <div className="h-3 w-14 rounded-full bg-neutral-200/70 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}
