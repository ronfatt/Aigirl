"use client";

import { useEffect, useMemo, useState } from "react";
import { VideoClipDraft } from "@/lib/types";

type MotionPreset = {
  id: string;
  label: string;
  description: string;
  motionLine: string;
};

const motionPresets: MotionPreset[] = [
  {
    id: "slow-push",
    label: "Slow Push",
    description: "A gentle forward drift that feels like a polished IG reel opener.",
    motionLine: "slow push-in toward the face with soft handheld steadiness",
  },
  {
    id: "window-drift",
    label: "Window Drift",
    description: "A subtle float from one side to the other with dreamy pacing.",
    motionLine: "subtle sideways drift with soft window-light mood and relaxed breathing space",
  },
  {
    id: "portrait-rise",
    label: "Portrait Rise",
    description: "A vertical glide that makes a still portrait feel alive.",
    motionLine: "slow upward glide from torso framing toward the face with calm premium motion",
  },
  {
    id: "soft-pan",
    label: "Soft Pan",
    description: "A light horizontal pan that works well for travel and lounge scenes.",
    motionLine: "light left-to-right pan with natural lifestyle pacing and no abrupt moves",
  },
];

interface VideoDraftBuilderProps {
  generationId: string;
  imageUrl: string;
  characterName: string;
  sceneTitle: string;
  onClipSaved?: (clip: VideoClipDraft) => void;
}

const FRAME_RATE = 15;
const WIDTH = 1080;
const HEIGHT = 1920;

export function VideoDraftBuilder({
  generationId,
  imageUrl,
  characterName,
  sceneTitle,
  onClipSaved,
}: VideoDraftBuilderProps) {
  const [motionPresetId, setMotionPresetId] = useState(motionPresets[0].id);
  const [durationSeconds, setDurationSeconds] = useState(6);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const motionPreset = useMemo(
    () => motionPresets.find((preset) => preset.id === motionPresetId) ?? motionPresets[0],
    [motionPresetId],
  );

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  async function renderClip() {
    setError(null);
    setIsRendering(true);

    try {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
      setVideoBlob(null);
      setSuccessMessage(null);

      const response = await fetch(imageUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to download the approved image for clip rendering.");
      }

      const imageBlob = await response.blob();
      const bitmap = await createImageBitmap(imageBlob);
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas rendering is not available in this browser.");
      }

      const stream = canvas.captureStream(FRAME_RATE);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.push(event.data);
        }
      };

      const finished = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      const totalFrames = durationSeconds * FRAME_RATE;
      const coverScale = Math.max(WIDTH / bitmap.width, HEIGHT / bitmap.height);

      recorder.start();

      for (let frame = 0; frame < totalFrames; frame += 1) {
        const progress = totalFrames <= 1 ? 0 : frame / (totalFrames - 1);
        drawFrame(context, bitmap, coverScale, progress, motionPreset.id);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 1000 / FRAME_RATE));
      }

      recorder.stop();
      const blob = await finished;
      const nextUrl = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(nextUrl);
    } catch (renderError) {
      setError(renderError instanceof Error ? renderError.message : "Unable to render the clip draft.");
    } finally {
      setIsRendering(false);
    }
  }

  function downloadPromptPack() {
    const payload = {
      characterName,
      sceneTitle,
      durationSeconds,
      motionPreset: motionPreset.label,
      motionPrompt: motionPreset.motionLine,
      sourceImageUrl: imageUrl,
      direction: `Create a short vertical lifestyle clip of ${characterName}. Use ${motionPreset.motionLine}. Keep the same face identity and preserve the approved image styling.`,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${characterName.toLowerCase().replace(/\s+/g, "-")}-${sceneTitle.toLowerCase().replace(/\s+/g, "-")}-clip-pack.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveClip() {
    if (!videoBlob) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("generationId", generationId);
      formData.append("sourceImageUrl", imageUrl);
      formData.append("motionPresetId", motionPreset.id);
      formData.append("motionLabel", motionPreset.label);
      formData.append("motionPrompt", motionPreset.motionLine);
      formData.append("durationSeconds", String(durationSeconds));
      formData.append(
        "file",
        new File(
          [videoBlob],
          `${characterName.toLowerCase().replace(/\s+/g, "-")}-${sceneTitle.toLowerCase().replace(/\s+/g, "-")}.webm`,
          { type: "video/webm" },
        ),
      );

      const response = await fetch("/api/video-clips", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { clip?: VideoClipDraft; error?: string };

      if (!response.ok || !payload.clip) {
        throw new Error(payload.error || "Unable to save video clip.");
      }

      setSuccessMessage(`Saved clip draft: ${payload.clip.id}`);
      onClipSaved?.(payload.clip);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save video clip.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Video clip draft</h3>
          <p className="text-sm text-zinc-400">
            Turn the approved image into a short vertical motion clip you can download and post manually.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadPromptPack}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
        >
          Download prompt pack
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Motion preset</span>
            <select
              value={motionPresetId}
              onChange={(event) => setMotionPresetId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {motionPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Duration</span>
            <select
              value={durationSeconds}
              onChange={(event) => setDurationSeconds(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
            >
              {[4, 6, 8].map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds} seconds
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-zinc-300">
            <p className="font-medium text-white">{motionPreset.label}</p>
            <p className="mt-2 leading-6 text-zinc-400">{motionPreset.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">Motion line</p>
            <p className="mt-1 leading-6 text-zinc-300">{motionPreset.motionLine}</p>
          </div>

          <button
            type="button"
            onClick={() => void renderClip()}
            disabled={isRendering}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRendering ? "Rendering clip..." : "Render vertical clip"}
          </button>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
          {videoUrl ? (
            <div className="space-y-4">
              <video
                controls
                playsInline
                loop
                src={videoUrl}
                className="aspect-[9/16] w-full rounded-2xl bg-black object-cover"
              />
              <a
                href={videoUrl}
                download={`${characterName.toLowerCase().replace(/\s+/g, "-")}-${sceneTitle.toLowerCase().replace(/\s+/g, "-")}.webm`}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
              >
                Download clip
              </a>
              <button
                type="button"
                onClick={() => void saveClip()}
                disabled={isSaving}
                className="ml-2 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save to library"}
              </button>
            </div>
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500">
              Render a clip draft to preview it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function drawFrame(
  context: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  coverScale: number,
  progress: number,
  motionPresetId: string,
) {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "#050505";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  let extraScale = 0;
  let xShift = 0;
  let yShift = 0;

  switch (motionPresetId) {
    case "window-drift":
      extraScale = 0.06;
      xShift = (progress - 0.5) * 90;
      break;
    case "portrait-rise":
      extraScale = 0.08;
      yShift = (0.5 - progress) * 140;
      break;
    case "soft-pan":
      extraScale = 0.04;
      xShift = (0.5 - progress) * 120;
      yShift = Math.sin(progress * Math.PI) * 24;
      break;
    default:
      extraScale = 0.1 * progress;
      yShift = (0.5 - progress) * 40;
      break;
  }

  const scale = coverScale + extraScale;
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const x = (WIDTH - drawWidth) / 2 + xShift;
  const y = (HEIGHT - drawHeight) / 2 + yShift;

  context.drawImage(bitmap, x, y, drawWidth, drawHeight);
}
