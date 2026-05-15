import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export interface AnalysisResult {
  faceShape: string;
  skinTone: string;
  undertone: string;
  hairTexture: string;
  hairDensity: string;
  scalpCondition: string;
  confidence: number;
  recommendations: {
    hairstyles: string[];
    colors: string[];
    treatments: string[];
    products: string[];
    homeCare: string[];
  };
}

let faceLandmarker: FaceLandmarker | null = null;
let isInitializing = false;
let isModelReady = false;
let isProcessing = false;
let lastTimestamp = 0;

export async function initializeDetector(): Promise<any> {
  if (faceLandmarker) return faceLandmarker;
  if (isInitializing) return null;
  
  isInitializing = true;
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    }).catch(async (err) => {
      console.warn("GPU initialization failed, falling back to CPU:", err);
      return await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "CPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
    });

    if (faceLandmarker) {
      isModelReady = true;
    }
    return faceLandmarker;
  } catch (error) {
    console.error("Failed to initialize FaceLandmarker:", error);
    return null;
  } finally {
    isInitializing = false;
  }
}

/**
 * Robust wrapper for face detection.
 * Optimized for real-time accuracy.
 */
export async function safeDetect(video: HTMLVideoElement): Promise<any[]> {
  const now = performance.now();

  if (!isModelReady || !faceLandmarker) return [];

  if (
    !video || 
    video.readyState < 2 || 
    video.videoWidth === 0 || 
    video.videoHeight === 0 ||
    video.paused ||
    video.ended
  ) {
    return [];
  }

  if (isProcessing) return [];

  // 15 FPS target for analysis to balance accuracy and performance
  if (now - lastTimestamp < 66) {
    return [];
  }

  isProcessing = true;
  try {
    const startTimeMs = performance.now();
    lastTimestamp = startTimeMs;
    
    const result = faceLandmarker.detectForVideo(video, startTimeMs);
    
    if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
      return [{
        keypoints: result.faceLandmarks[0].map(landmark => ({
          x: landmark.x * video.videoWidth,
          y: landmark.y * video.videoHeight,
          z: landmark.z
        }))
      }];
    }
  } catch (error) {
    console.warn("safeDetect error:", error);
  } finally {
    isProcessing = false;
  }

  return [];
}

export function calculateFaceShape(landmarks: any[]) {
  if (!landmarks || landmarks.length < 468) return "Oval";

  // Geometric markers
  const top = landmarks[10];
  const bottom = landmarks[152];
  const left = landmarks[234];
  const right = landmarks[454];
  const jawL = landmarks[172];
  const jawR = landmarks[397];
  const foreheadL = landmarks[103];
  const foreheadR = landmarks[332];

  const faceHeight = Math.abs(top.y - bottom.y);
  const faceWidth = Math.abs(left.x - right.x);
  const jawWidth = Math.abs(jawL.x - jawR.x);
  const foreheadWidth = Math.abs(foreheadL.x - foreheadR.x);

  const ratioHeightWidth = faceHeight / faceWidth;
  
  // Heart: Broad forehead, narrow jaw
  if (foreheadWidth > jawWidth * 1.3) return "Heart";
  
  // Square: Jaw width is close to face width, shorter face
  if (jawWidth > faceWidth * 0.9 && ratioHeightWidth < 1.35) return "Square";
  
  // Round: Height and width are nearly equal
  if (ratioHeightWidth < 1.15) return "Round";
  
  // Oblong: Face is significantly longer than wide
  if (ratioHeightWidth > 1.55) return "Oblong";
  
  // Diamond: Cheeks are the widest part
  if (faceWidth > foreheadWidth * 1.25 && faceWidth > jawWidth * 1.25) return "Diamond";

  return "Oval";
}

export function analyzeSkin(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { tone: "Medium", undertone: "Neutral" };

  const { width, height } = canvas;
  // Sample 4 specific zones for high accuracy (Cheeks, Forehead)
  const leftCheek = ctx.getImageData(Math.floor(width * 0.35), Math.floor(height * 0.5), 10, 10).data;
  const rightCheek = ctx.getImageData(Math.floor(width * 0.65), Math.floor(height * 0.5), 10, 10).data;
  const forehead = ctx.getImageData(Math.floor(width * 0.5), Math.floor(height * 0.3), 10, 10).data;
  
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 400; i += 4) {
    r += (leftCheek[i] + rightCheek[i] + forehead[i]) / 3;
    g += (leftCheek[i+1] + rightCheek[i+1] + forehead[i+1]) / 3;
    b += (leftCheek[i+2] + rightCheek[i+2] + forehead[i+2]) / 3;
  }
  
  r /= 100; g /= 100; b /= 100;

  let tone = "Medium";
  const brightness = (r + g + b) / 3;
  if (brightness > 230) tone = "Fair";
  else if (brightness > 190) tone = "Light";
  else if (brightness > 145) tone = "Medium";
  else if (brightness > 100) tone = "Tan";
  else tone = "Deep";

  let undertone = "Neutral";
  const redGreenDiff = r - g;
  if (redGreenDiff > 20) undertone = "Warm";
  else if (b > r && b > g) undertone = "Cool";
  else undertone = "Neutral";

  return { tone, undertone };
}

export function generateRuleBasedRecommendations(data: any) {
  const { faceShape, skinTone, undertone, hairTexture, scalpCondition } = data;
  
  const recs = {
    hairstyles: [] as string[],
    colors: [] as string[],
    treatments: [] as string[],
    products: [] as string[],
    homeCare: [] as string[]
  };

  // Logic mapping for high personalization
  if (faceShape === "Oval") {
    recs.hairstyles = ["Long Polished Layers", "Curtain Bangs", "Blunt Textured Bob"];
  } else if (faceShape === "Round") {
    recs.hairstyles = ["Structured Pixie", "Long Vertical Layers", "Deep Side Part"];
  } else if (faceShape === "Heart") {
    recs.hairstyles = ["Chin-Length Inverted Bob", "Wispy Bangs", "Soft Face Framing"];
  } else if (faceShape === "Square") {
    recs.hairstyles = ["Side-Swept Fringe", "Long Waves", "Soft Shag"];
  } else {
    recs.hairstyles = ["A-Line Bob", "Textured Mid-Length", "Layered Lob"];
  }

  if (undertone === "Warm") {
    recs.colors = ["Golden Caramel", "Warm Honey Brown", "Copper Infusion"];
  } else if (undertone === "Cool") {
    recs.colors = ["Ash Platinum", "Icy Champagne", "Cool Charcoal"];
  } else {
    recs.colors = ["Natural Mocha", "Sandy Beige", "True Chocolate"];
  }

  if (scalpCondition === "Dry") {
    recs.treatments.push("Intense Lipid Restoration");
    recs.products.push("Hydrating Cleansing Cream", "Moisture Retention Mask");
    recs.homeCare.push("Weekly cold-pressed oil treatment");
  } else if (scalpCondition === "Oily") {
    recs.treatments.push("Ph-Balancing Scalp Detox");
    recs.products.push("Volumizing Clay Wash", "Sebum Control Serum");
    recs.homeCare.push("Daily scalp massage with rosemary water");
  } else {
    recs.treatments.push("Molecular Keratin Shine Booster");
    recs.products.push("Balancing Daily Cleanser", "Lustre Mist");
    recs.homeCare.push("Standard maintenance schedule");
  }

  return recs;
}

export const DEFAULT_RESULT: AnalysisResult = {
  faceShape: "Unknown",
  skinTone: "Medium",
  undertone: "Neutral",
  hairTexture: "Wavy",
  hairDensity: "Medium",
  scalpCondition: "Normal",
  confidence: 0,
  recommendations: {
    hairstyles: ["Long Layers"],
    colors: ["Natural Brown"],
    treatments: ["Deep Conditioning"],
    products: ["Hydrating Shampoo"],
    homeCare: ["Weekly nourishing hair mask"]
  }
};
