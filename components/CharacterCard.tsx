import Image from "next/image";
import { Character } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

export function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] shadow-panel">
      <div className="relative h-72">
        <Image
          src={character.masterReferenceImageUrl}
          alt={character.displayName}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{character.displayName}</h3>
            <p className="text-sm text-zinc-400">
              {character.identityStyle} • {character.city}
            </p>
          </div>
          <StatusBadge status={character.isActive ? "approved" : "draft"} />
        </div>

        <p className="text-sm leading-6 text-zinc-300">{character.bio}</p>

        <div className="grid gap-3 text-sm text-zinc-400">
          <p>
            <span className="text-zinc-500">Age range:</span> {character.ageRange}
          </p>
          <p>
            <span className="text-zinc-500">Vibe:</span> {character.vibe}
          </p>
          <p>
            <span className="text-zinc-500">Tone:</span> {character.postingTone}
          </p>
          <p>
            <span className="text-zinc-500">Identity lock:</span> {character.identityLockStrength}
          </p>
          <p>
            <span className="text-zinc-500">Reference slots:</span>{" "}
            {[character.faceReferenceImageUrl, character.styleReferenceImageUrl, character.bodyReferenceImageUrl]
              .filter(Boolean)
              .length || 1}
          </p>
        </div>
      </div>
    </div>
  );
}
