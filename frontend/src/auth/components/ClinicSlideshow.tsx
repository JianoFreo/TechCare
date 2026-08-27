import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideItem {
  src: string;
  title?: string;
  subtitle?: string;
}

const CLINIC_SLIDES: SlideItem[] = [
  {
    src: "/assets/clinic-reception.webp",
    title: "Reception & Waiting Area",
    subtitle: "Intay ka muna dito malamig o kaya punta ka sa website namin track mo queue",
  },
  {
    src: "/assets/clinic-lab.webp",
    title: "Diagnostic Laboratory",
    subtitle: "Panis sa equipment nagngangawngaw bagong luto",
  },
  {
    src: "/assets/clinic-xray.webp",
    title: "Radiology & Imaging",
    subtitle: "Scan natin kung ikaw pa ba",
  },
];

interface ClinicSlideshowProps {
  slides?: SlideItem[];
  autoPlayInterval?: number;
}

function ClinicSlideshow({
  slides = CLINIC_SLIDES,
  autoPlayInterval = 2000,
}: ClinicSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [nextSlide, autoPlayInterval, isHovered, slides.length]);

  return (
    <div
      className="group relative w-full h-full min-h-[480px] lg:min-h-[580px] rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center select-none shadow-inner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
            } transition-transform duration-1000 ease-out`}
          >
            <img
              src={slide.src}
              alt={slide.title || `Clinic photo ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            
            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-16 left-6 right-6 z-20 text-white drop-shadow-md">
                {slide.title && (
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-white">
                    {slide.title}
                  </h3>
                )}
                {slide.subtitle && (
                  <p className="text-sm text-slate-200 line-clamp-2 max-w-md">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "w-8 bg-sky-400"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ClinicSlideshow;
