"use client";
import Image from "next/image";
import { useState } from "react";
import type { MediaAsset } from "@/src/types";
import { cn } from "@/src/lib/utils";

export function ResponsiveImage({ asset, className, imageClassName, priority = false, sizes = "(max-width: 768px) 100vw, 50vw" }: { asset: MediaAsset; className?: string; imageClassName?: string; priority?: boolean; sizes?: string }) {
  const [src, setSrc] = useState(asset.src);
  return <div className={cn("relative overflow-hidden bg-charcoal", className)} data-cursor="view"><Image src={src} alt={asset.alt} fill priority={priority} sizes={sizes} className={cn("object-cover", imageClassName)} style={{ objectPosition: `${asset.focalPoint?.x ?? 50}% ${asset.focalPoint?.y ?? 50}%` }} onError={() => setSrc("/images/placeholders/fallback.svg")} /></div>;
}
