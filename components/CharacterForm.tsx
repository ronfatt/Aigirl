"use client";

import type { FormEvent, ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { Character, CharacterInput, PostingTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const postingTones: PostingTone[] = [
  "soft lifestyle",
  "casual intimate",
  "playful",
  "elegant minimal",
];

const defaultValues: CharacterInput = {
  name: "",
  displayName: "",
  ageRange: "",
  identityStyle: "",
  city: "",
  bio: "",
  vibe: "",
  appearanceDescription: "",
  masterReferenceImageUrl: "",
  stylePrompt: "",
  negativePrompt: "",
  postingTone: "soft lifestyle",
  isActive: true,
};

interface CharacterFormProps {
  initialCharacter?: Character | null;
  onSaved?: (character: Character) => void;
}

export function CharacterForm({ initialCharacter, onSaved }: CharacterFormProps) {
  const [form, setForm] = useState<CharacterInput>(initialCharacter ?? defaultValues);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReference, setUploadingReference] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function updateField<K extends keyof CharacterInput>(key: K, value: CharacterInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleReferenceUpload(file: File) {
    setError(null);
    setMessage(null);
    setUploadingReference(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-reference", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to upload reference image.");
      }

      updateField("masterReferenceImageUrl", payload.url);
      setMessage("Reference image uploaded and URL filled in.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploadingReference(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const method = initialCharacter ? "PUT" : "POST";
      const endpoint = initialCharacter
        ? `/api/characters/${initialCharacter.id}`
        : "/api/characters";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const payload = (await response.json()) as { error?: string; character?: Character };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to save character.");
        }

        if (payload.character) {
          setForm({
            name: payload.character.name,
            displayName: payload.character.displayName,
            ageRange: payload.character.ageRange,
            identityStyle: payload.character.identityStyle,
            city: payload.character.city,
            bio: payload.character.bio,
            vibe: payload.character.vibe,
            appearanceDescription: payload.character.appearanceDescription,
            masterReferenceImageUrl: payload.character.masterReferenceImageUrl,
            stylePrompt: payload.character.stylePrompt,
            negativePrompt: payload.character.negativePrompt,
            postingTone: payload.character.postingTone,
            isActive: payload.character.isActive,
          });
          onSaved?.(payload.character);
        }

        setMessage(initialCharacter ? "Character updated." : "Character created.");
      } catch (submissionError) {
        setError(
          submissionError instanceof DOMException && submissionError.name === "AbortError"
            ? "Saving timed out. The database did not respond in time."
            : submissionError instanceof Error
              ? submissionError.message
              : "Something went wrong while saving.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClassName}
            placeholder="stella-ray"
          />
        </Field>
        <Field label="Display name">
          <input
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            className={inputClassName}
            placeholder="Stella Ray"
          />
        </Field>
        <Field label="Age range">
          <input
            value={form.ageRange}
            onChange={(event) => updateField("ageRange", event.target.value)}
            className={inputClassName}
            placeholder="24-28"
          />
        </Field>
        <Field label="Nationality / identity style">
          <input
            value={form.identityStyle}
            onChange={(event) => updateField("identityStyle", event.target.value)}
            className={inputClassName}
            placeholder="Mediterranean lifestyle creator"
          />
        </Field>
        <Field label="City / location">
          <input
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            className={inputClassName}
            placeholder="Barcelona"
          />
        </Field>
        <Field label="Posting tone">
          <select
            value={form.postingTone}
            onChange={(event) => updateField("postingTone", event.target.value as PostingTone)}
            className={inputClassName}
          >
            {postingTones.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Short bio">
        <textarea
          value={form.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          className={textareaClassName}
          rows={3}
        />
      </Field>
      <Field label="Vibe / personality">
        <textarea
          value={form.vibe}
          onChange={(event) => updateField("vibe", event.target.value)}
          className={textareaClassName}
          rows={2}
        />
      </Field>
      <Field label="Appearance description">
        <textarea
          value={form.appearanceDescription}
          onChange={(event) => updateField("appearanceDescription", event.target.value)}
          className={textareaClassName}
          rows={3}
        />
      </Field>
      <Field label="Master reference image URL">
        <div className="space-y-3">
          <input
            value={form.masterReferenceImageUrl}
            onChange={(event) => updateField("masterReferenceImageUrl", event.target.value)}
            className={inputClassName}
            placeholder="https://..."
          />
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void handleReferenceUpload(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingReference}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingReference ? "Uploading..." : "Upload reference photo"}
            </button>
            <p className="text-xs text-zinc-400">
              Upload one portrait or lifestyle reference image to store it in Supabase Storage.
            </p>
          </div>
        </div>
      </Field>
      <Field label="Style prompt">
        <textarea
          value={form.stylePrompt}
          onChange={(event) => updateField("stylePrompt", event.target.value)}
          className={textareaClassName}
          rows={3}
        />
      </Field>
      <Field label="Negative prompt">
        <textarea
          value={form.negativePrompt}
          onChange={(event) => updateField("negativePrompt", event.target.value)}
          className={textareaClassName}
          rows={3}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => updateField("isActive", event.target.checked)}
          className="h-4 w-4 rounded border-white/10 bg-transparent"
        />
        Active persona
      </label>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm">
          {error ? <p className="text-rose-300">{error}</p> : null}
          {message ? <p className="text-emerald-300">{message}</p> : null}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition",
            isPending && "cursor-not-allowed opacity-60",
          )}
        >
          {isPending ? "Saving..." : initialCharacter ? "Update Character" : "Create Character"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25";

const textareaClassName = `${inputClassName} resize-none`;
