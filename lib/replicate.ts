const REPLICATE_API_URL = "https://api.replicate.com/v1";
const DEFAULT_MODEL = "black-forest-labs/flux-dev";
const DEFAULT_POLL_ATTEMPTS = 15;
const DEFAULT_POLL_INTERVAL_MS = 1500;
const DEFAULT_PROMPT_STRENGTH = 0.9;

type ReplicatePredictionResponse = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  error?: string | null;
  output?: unknown;
};

type ReplicatePredictionInput = {
  prompt: string;
  image?: string;
  prompt_strength?: number;
  num_outputs?: number;
  aspect_ratio?: string;
  output_format?: "jpg" | "png" | "webp";
  safety_tolerance?: number;
};

function getReplicateHeaders(wait = false) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    throw new Error("Missing REPLICATE_API_TOKEN.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: wait ? "wait=60" : "respond-async",
  };
}

function getModelPath() {
  const rawModel = process.env.REPLICATE_MODEL?.trim() || DEFAULT_MODEL;

  if (!rawModel.includes("/")) {
    throw new Error(
      `Invalid REPLICATE_MODEL "${rawModel}". Expected "owner/model-name" format.`,
    );
  }

  return rawModel;
}

async function parseReplicateResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Replicate request failed (${response.status}): ${text || response.statusText}`);
  }

  return (await response.json()) as ReplicatePredictionResponse;
}

function normalizeReplicateOutput(output: unknown) {
  if (Array.isArray(output)) {
    return output.filter((value): value is string => typeof value === "string");
  }

  if (typeof output === "string") {
    return [output];
  }

  return [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createReplicatePrediction(input: ReplicatePredictionInput) {
  const modelPath = getModelPath();
  const response = await fetch(`${REPLICATE_API_URL}/models/${modelPath}/predictions`, {
    method: "POST",
    headers: getReplicateHeaders(true),
    body: JSON.stringify({
      input,
    }),
  });

  return parseReplicateResponse(response);
}

export async function waitForReplicatePrediction(predictionId: string) {
  for (let attempt = 0; attempt < DEFAULT_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${REPLICATE_API_URL}/predictions/${predictionId}`, {
      headers: getReplicateHeaders(),
      cache: "no-store",
    });
    const prediction = await parseReplicateResponse(response);

    if (prediction.status === "succeeded") {
      return prediction;
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(prediction.error || `Replicate prediction ${prediction.status}.`);
    }

    await sleep(DEFAULT_POLL_INTERVAL_MS);
  }

  throw new Error("Replicate prediction timed out.");
}

export async function generateReplicateImages(input: {
  finalPrompt: string;
  referenceImageUrl?: string;
  count: number;
  promptStrength?: number;
}) {
  const configuredPromptStrength = Number(
    input.promptStrength ?? process.env.REPLICATE_PROMPT_STRENGTH ?? DEFAULT_PROMPT_STRENGTH,
  );
  const promptStrength = Number.isFinite(configuredPromptStrength)
    ? Math.min(Math.max(configuredPromptStrength, 0.1), 1)
    : DEFAULT_PROMPT_STRENGTH;

  const prediction = await createReplicatePrediction({
    prompt: input.finalPrompt,
    image: input.referenceImageUrl,
    // Higher prompt strength pushes the model to create a new scene and pose
    // while still borrowing identity cues from the reference image.
    prompt_strength: input.referenceImageUrl ? promptStrength : undefined,
    num_outputs: input.count,
    aspect_ratio: "4:5",
    output_format: "jpg",
    safety_tolerance: 2,
  });

  const resolved =
    prediction.status === "succeeded"
      ? prediction
      : await waitForReplicatePrediction(prediction.id);

  const imageUrls = normalizeReplicateOutput(resolved.output);

  if (!imageUrls.length) {
    throw new Error("Replicate returned no image URLs.");
  }

  return imageUrls;
}
