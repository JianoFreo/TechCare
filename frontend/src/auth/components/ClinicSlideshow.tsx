import { useState, useEffect, useCallback } from "react";

interface SlideItem {
  src: string;
  title?: string;
  subtitle?: string;
}

const CLINIC_SLIDES: SlideItem[] = [
  {
    src: "/assets/clinic-reception.webp",
    title: "Reception & Waiting Area",
    subtitle: "Stay cool in our reception and waiting area, or conveniently track your queue status directly on our website.",
  },
  {
    src: "/assets/clinic-extraction.webp",
    title: "Extraction & Triage Area",
    subtitle: "The extraction area is the designated space where medical professionals safely perform procedures and collect diagnostic specimens.",
  },
  {
    src: "/assets/clinic-consultation.webp",
    title: "Consultation Room",
    subtitle: "Meet with your attending physician for your check-up and medical results discussion.",
  },
  {
    src: "/assets/clinic-lab.webp",
    title: "Diagnostic Laboratory",
    subtitle: "State-of-the-art facility for accurate and timely diagnostic testing.",
  },
  {
    src: "/assets/clinic-xray.webp",
    title: "Radiology & Imaging",
    subtitle: "Advanced imaging technology for precise diagnosis.",
  },
  {
    src: "/assets/clinic-xray-room.webp",
    title: "X-Ray Facility",
    subtitle: "Modern x-ray equipment for high-quality imaging.",
  },
];

interface ClinicSlideshowProps {
  slides?: SlideItem[];
  autoPlayInterval?: number;
}

function ClinicSlideshow({
  slides = CLINIC_SLIDES,
  autoPlayInterval = 4500,
}: ClinicSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [nextSlide, autoPlayInterval, currentIndex, slides.length]);

  return (
    <div
      onClick={nextSlide}
      className="group relative w-full h-full min-h-[480px] lg:min-h-[580px] rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center select-none shadow-inner cursor-pointer"
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive
                ? "opacity-100 z-10 scale-100"
                : "opacity-0 z-0 scale-105 pointer-events-none"
            }`}
          >
            <img
              src={slide.src}
              alt={slide.title || `Clinic photo ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            {(slide.title || slide.subtitle) && (
              <div className="absolute bottom-16 left-6 right-6 z-20 text-white drop-shadow-md transition-opacity duration-700">
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
        <div
          className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-sky-400"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClinicSlideshow;
