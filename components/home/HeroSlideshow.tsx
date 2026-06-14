"use client";

import { useEffect, useState } from "react";

export interface HeroImage {
  url: string;
  caption: string;
}

/**
 * Background slideshow for the home hero. Cross-fades through World Cup 2026
 * venue photos (sourced from the app's stadium data, Wikimedia Commons).
 * The set/order is chosen daily on the server, so it refreshes every day.
 */
export default function HeroSlideshow({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {images.map((img, i) => (
        <div
          key={img.url}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url("${img.url}")` }}
        />
      ))}
      <span className="absolute bottom-2 right-4 text-[10px] font-medium uppercase tracking-wide text-white/60">
        {images[index].caption}
      </span>
    </div>
  );
}
