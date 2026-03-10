"use client";

import { SceneTemplate } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

interface SceneSelectorProps {
  scenes: SceneTemplate[];
  selectedSceneId: string;
  onSelect: (value: string) => void;
}

export function SceneSelector({ scenes, selectedSceneId, onSelect }: SceneSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {scenes.map((scene) => {
        const active = scene.id === selectedSceneId;

        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelect(scene.id)}
            className={cn(
              "rounded-[1.3rem] border p-4 text-left transition",
              active
                ? "border-white/20 bg-white/10"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-white">{scene.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {scene.category}
                </p>
              </div>
              <StatusBadge status={scene.riskLevel} />
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">{scene.captionHint}</p>
          </button>
        );
      })}
    </div>
  );
}
