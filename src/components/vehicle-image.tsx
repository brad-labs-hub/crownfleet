"use client";

import { useState } from "react";

type Props = {
  make: string;
  model: string;
  year: number;
  vin?: string | null;
  className?: string;
};

// Brand logo fallback map — Clearbit serves square logos reliably
const BRAND_LOGOS: Record<string, string> = {
  "acura":        "https://logo.clearbit.com/acura.com",
  "alfa romeo":   "https://logo.clearbit.com/alfaromeo.com",
  "aston martin": "https://logo.clearbit.com/astonmartin.com",
  "audi":         "https://logo.clearbit.com/audi.com",
  "bentley":      "https://logo.clearbit.com/bentleymotors.com",
  "bmw":          "https://logo.clearbit.com/bmw.com",
  "bugatti":      "https://logo.clearbit.com/bugatti.com",
  "buick":        "https://logo.clearbit.com/buick.com",
  "cadillac":     "https://logo.clearbit.com/cadillac.com",
  "chevrolet":    "https://logo.clearbit.com/chevrolet.com",
  "chrysler":     "https://logo.clearbit.com/chrysler.com",
  "dodge":        "https://logo.clearbit.com/dodge.com",
  "ferrari":      "https://logo.clearbit.com/ferrari.com",
  "fiat":         "https://logo.clearbit.com/fiat.com",
  "ford":         "https://logo.clearbit.com/ford.com",
  "genesis":      "https://logo.clearbit.com/genesis.com",
  "gmc":          "https://logo.clearbit.com/gmc.com",
  "honda":        "https://logo.clearbit.com/honda.com",
  "hyundai":      "https://logo.clearbit.com/hyundai.com",
  "infiniti":     "https://logo.clearbit.com/infiniti.com",
  "jaguar":       "https://logo.clearbit.com/jaguar.com",
  "jeep":         "https://logo.clearbit.com/jeep.com",
  "kia":          "https://logo.clearbit.com/kia.com",
  "lamborghini":  "https://logo.clearbit.com/lamborghini.com",
  "land rover":   "https://logo.clearbit.com/landrover.com",
  "lexus":        "https://logo.clearbit.com/lexus.com",
  "lincoln":      "https://logo.clearbit.com/lincoln.com",
  "maserati":     "https://logo.clearbit.com/maserati.com",
  "mclaren":      "https://logo.clearbit.com/mclaren.com",
  "mercedes":     "https://logo.clearbit.com/mercedes-benz.com",
  "mercedes-benz":"https://logo.clearbit.com/mercedes-benz.com",
  "mini":         "https://logo.clearbit.com/mini.com",
  "mitsubishi":   "https://logo.clearbit.com/mitsubishi.com",
  "nissan":       "https://logo.clearbit.com/nissanusa.com",
  "porsche":      "https://logo.clearbit.com/porsche.com",
  "ram":          "https://logo.clearbit.com/ramtrucks.com",
  "rolls royce":  "https://logo.clearbit.com/rolls-roycemotorcars.com",
  "rolls-royce":  "https://logo.clearbit.com/rolls-roycemotorcars.com",
  "subaru":       "https://logo.clearbit.com/subaru.com",
  "tesla":        "https://logo.clearbit.com/tesla.com",
  "toyota":       "https://logo.clearbit.com/toyota.com",
  "vespa":        "https://logo.clearbit.com/vespa.com",
  "volkswagen":   "https://logo.clearbit.com/vw.com",
  "volvo":        "https://logo.clearbit.com/volvocars.com",
};

// Stable color derived from the make name (for placeholder background)
function makeColor(make: string): string {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  ];
  let hash = 0;
  for (let i = 0; i < make.length; i++) hash += make.charCodeAt(i);
  return colors[hash % colors.length];
}

// 0 = Imagin Studio, 1 = brand logo, 2 = placeholder
type ImageState = 0 | 1 | 2;

export function VehicleImage({ make, model, year, className = "" }: Props) {
  const [state, setState] = useState<ImageState>(0);

  const makeKey = make.toLowerCase().trim();
  const brandLogoUrl = BRAND_LOGOS[makeKey];

  // Imagin Studio: encode make/model for URL
  const imaginUrl = `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${year}&angle=23&zoomType=fullscreen`;

  const handleImaginError = () => {
    setState(brandLogoUrl ? 1 : 2);
  };

  const handleLogoError = () => {
    setState(2);
  };

  // Placeholder — brand initials
  if (state === 2) {
    const initials = make
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("");
    return (
      <div
        className={`flex items-center justify-center rounded font-bold text-sm select-none ${makeColor(make)} ${className}`}
      >
        {initials}
      </div>
    );
  }

  // Brand logo
  if (state === 1 && brandLogoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brandLogoUrl}
        alt={make}
        onError={handleLogoError}
        className={`object-contain rounded bg-white dark:bg-neutral-800 p-1 ${className}`}
      />
    );
  }

  // Imagin Studio car photo
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imaginUrl}
      alt={`${year} ${make} ${model}`}
      onError={handleImaginError}
      className={`object-cover rounded ${className}`}
    />
  );
}
