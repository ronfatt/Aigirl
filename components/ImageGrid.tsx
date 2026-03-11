"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: string[];
  selectedImage?: string | null;
  onSelect?: (url: string) => void;
  onPreview?: (url: string) => void;
}

export function ImageGrid({ images, selectedImage, onSelect, onPreview }: ImageGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {images.map((image) => {
        const active = image === selectedImage;

        return (
          <div
            key={image}
            className={cn(
              "group relative overflow-hidden rounded-[1.4rem] border transition",
              active ? "border-white" : "border-white/10 hover:border-white/25",
            )}
          >
            <div className="relative h-80">
              <Image src={image} alt="Generated persona" fill className="object-cover" />
            </div>
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-sm text-white",
                active ? "opacity-100" : "opacity-0 transition group-hover:opacity-100",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{active ? "Approved image" : "Generated image"}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onPreview?.(image)}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelect?.(image)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition",
                      active
                        ? "bg-white text-black"
                        : "border border-white/20 bg-black/20 text-white hover:bg-white/10",
                    )}
                  >
                    {active ? "Approved" : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
