"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: string[];
  selectedImage?: string | null;
  onSelect?: (url: string) => void;
}

export function ImageGrid({ images, selectedImage, onSelect }: ImageGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {images.map((image) => {
        const active = image === selectedImage;

        return (
          <button
            key={image}
            type="button"
            onClick={() => onSelect?.(image)}
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
                "absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-4 text-sm text-white",
                active ? "opacity-100" : "opacity-0 transition group-hover:opacity-100",
              )}
            >
              <span>{active ? "Approved image" : "Select image"}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
