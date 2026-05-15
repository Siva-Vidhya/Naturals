import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// ─── Singleton state (module-level, never stale) ───────────────────────────
let _faceLandmarker: FaceLandmarker | null = null;
let _isInitializing = false;
let _isProcessing = false;
let _lastTs = 0;

/**
 * Initialise the MediaPipe FaceLandmarker once and reuse it.
 * Falls back from GPU → CPU automatically.
 */
export async function initializeDetector(): Promise<FaceLandmarker | null> {
  if (_faceLandmarker) return _faceLandmarker;
  if (_isInitializing) {
    // Poll until ready (max 30 s)
    const deadline = Date.now() + 30_000;
    while (!_faceLandmarker && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 200));
    }
    return _faceLandmarker;
  }

  _isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const opts = (delegate: "GPU" | "CPU") => ({
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate,
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO" as const,
      numFaces: 1,
    });

    try {
      _faceLandmarker = await FaceLandmarker.createFromOptions(vision, opts("GPU"));
    } catch {
      console.warn("GPU delegate failed – retrying with CPU");
      _faceLandmarker = await FaceLandmarker.createFromOptions(vision, opts("CPU"));
    }

    console.log("FaceLandmarker ready");
    return _faceLandmarker;
  } catch (err) {
    console.error("FaceLandmarker init error:", err);
    return null;
  } finally {
    _isInitializing = false;
  }
}

/**
 * Thread-safe, throttled wrapper around detectForVideo.
 * Returns an array of keypoint arrays (one per face detected).
 */
export async function safeDetect(
  video: HTMLVideoElement
): Promise<{ x: number; y: number; z: number }[][]> {
  if (!_faceLandmarker) return [];
  if (_isProcessing) return [];
  if (!video || video.readyState < 2) return [];
  if (video.videoWidth === 0 || video.videoHeight === 0) return [];
  if (video.paused || video.ended) return [];

  // Throttle to ~15 fps
  const now = performance.now();
  if (now - _lastTs < 66) return [];

  _isProcessing = true;
  try {
    _lastTs = now;
    const result = _faceLandmarker.detectForVideo(video, now);
    if (!result?.faceLandmarks?.length) return [];
    return result.faceLandmarks.map((face) =>
      face.map((lm) => ({
        x: lm.x * video.videoWidth,
        y: lm.y * video.videoHeight,
        z: lm.z ?? 0,
      }))
    );
  } catch (err) {
    console.warn("safeDetect:", err);
    return [];
  } finally {
    _isProcessing = false;
  }
}

// ─── Face-shape geometry ───────────────────────────────────────────────────
export function calculateFaceShape(lm: { x: number; y: number; z: number }[]) {
  if (!lm || lm.length < 468) return "Oval";

  const d = (a: number, b: number) =>
    Math.hypot(lm[a].x - lm[b].x, lm[a].y - lm[b].y);

  const faceHeight   = d(10, 152);
  const faceWidth    = d(234, 454);
  const jawWidth     = d(172, 397);
  const foreheadW    = d(103, 332);
  const ratio        = faceHeight / (faceWidth || 1);

  if (foreheadW > jawWidth * 1.3)              return "Heart";
  if (jawWidth   > faceWidth * 0.9 && ratio < 1.35) return "Square";
  if (ratio < 1.15)                            return "Round";
  if (ratio > 1.55)                            return "Oblong";
  if (faceWidth  > foreheadW * 1.25 && faceWidth > jawWidth * 1.25) return "Diamond";
  return "Oval";
}

// ─── Skin-tone analysis ────────────────────────────────────────────────────
export function analyzeSkin(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { tone: "Medium", undertone: "Neutral" };

  const { width: W, height: H } = canvas;
  const sample = (cx: number, cy: number) =>
    ctx.getImageData(Math.floor(cx * W), Math.floor(cy * H), 8, 8).data;

  const zones = [
    sample(0.35, 0.48), // left cheek
    sample(0.65, 0.48), // right cheek
    sample(0.5,  0.28), // forehead
  ];

  let r = 0, g = 0, b = 0, count = 0;
  for (const z of zones) {
    for (let i = 0; i < z.length; i += 4) {
      r += z[i]; g += z[i + 1]; b += z[i + 2];
      count++;
    }
  }
  r /= count; g /= count; b /= count;

  const brightness = (r + g + b) / 3;
  const tone =
    brightness > 225 ? "Fair"   :
    brightness > 190 ? "Light"  :
    brightness > 150 ? "Medium" :
    brightness > 105 ? "Tan"    : "Deep";

  const undertone =
    r - g > 18 ? "Warm" :
    b > r      ? "Cool" : "Neutral";

  return { tone, undertone };
}

// ─── Recommendations ───────────────────────────────────────────────────────
export function generateRuleBasedRecommendations(data: {
  faceShape: string;
  skinTone?: string;
  undertone: string;
  hairTexture?: string;
  scalpCondition?: string;
}) {
  const { faceShape, undertone, scalpCondition = "Normal" } = data;

  const hairstyleMap: Record<string, string[]> = {
    Oval:    ["Long Polished Layers", "Curtain Bangs", "Blunt Textured Bob"],
    Round:   ["Structured Pixie", "Long Vertical Layers", "Deep Side Part"],
    Heart:   ["Chin-Length Inverted Bob", "Wispy Bangs", "Soft Face-Framing"],
    Square:  ["Side-Swept Fringe", "Long Soft Waves", "Shag Cut"],
    Diamond: ["Textured Mid-Length", "Side Parted Waves", "Layered Lob"],
    Oblong:  ["Voluminous Waves", "Blunt Bob", "Curtain Fringe"],
  };

  const colorMap: Record<string, string[]> = {
    Warm:    ["Golden Caramel", "Warm Honey Brown", "Copper Balayage"],
    Cool:    ["Ash Platinum", "Icy Champagne", "Cool Charcoal"],
    Neutral: ["Natural Mocha", "Sandy Beige", "True Chocolate"],
  };

  const treatmentMap: Record<string, string[]> = {
    Dry:       ["Intense Lipid Restoration Treatment"],
    Oily:      ["Ph-Balancing Scalp Detox"],
    Sensitive: ["Gentle Soothing Scalp Serum"],
    Normal:    ["Molecular Keratin Shine Booster"],
  };

  const productMap: Record<string, string[]> = {
    Dry:       ["Hydrating Cleansing Cream", "Moisture Retention Mask"],
    Oily:      ["Volumizing Clay Wash", "Sebum Control Serum"],
    Sensitive: ["Fragrance-Free Shampoo", "Calming Scalp Tonic"],
    Normal:    ["Balancing Daily Cleanser", "Lustre Finishing Mist"],
  };

  const homeCareMap: Record<string, string[]> = {
    Dry:       ["Weekly cold-pressed oil treatment", "Avoid sulphate shampoos"],
    Oily:      ["Daily scalp massage with rosemary water", "Clarify every 3 days"],
    Sensitive: ["Lukewarm water only", "Patch-test new products"],
    Normal:    ["Maintain conditioning routine", "Protect from heat weekly"],
  };

  return {
    hairstyles: hairstyleMap[faceShape]     ?? hairstyleMap.Oval,
    colors:     colorMap[undertone]          ?? colorMap.Neutral,
    treatments: treatmentMap[scalpCondition] ?? treatmentMap.Normal,
    products:   productMap[scalpCondition]   ?? productMap.Normal,
    homeCare:   homeCareMap[scalpCondition]  ?? homeCareMap.Normal,
  };
}
