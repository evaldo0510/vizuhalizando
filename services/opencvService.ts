
declare global {
  interface Window {
    cv: any;
  }
}

/**
 * Checks if OpenCV is loaded and ready.
 * Waits up to 10 seconds for initialization.
 */
export const ensureOpenCVReady = async (): Promise<boolean> => {
  if (window.cv && window.cv.Mat) return true;

  let retries = 0;
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        clearInterval(interval);
        console.log("OpenCV.js is ready.");
        resolve(true);
      }
      retries++;
      if (retries > 100) { // Approx 10 seconds
        clearInterval(interval);
        console.warn("OpenCV.js failed to load or timed out.");
        resolve(false);
      }
    }, 100);
  });
};

/**
 * Loads an image from a base64 string into an HTMLImageElement
 */
const loadImage = (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  });
};

/**
 * Preprocesses the image using OpenCV to improve quality for AI Analysis.
 * Pipeline:
 * 1. CLAHE (Contrast Limited Adaptive Histogram Equalization) - Normalizes lighting
 * 2. Gaussian Blur - Reduces high-frequency noise
 * 3. Unsharp Mask - Sharpens features (eyes, edges)
 */
// services/opencvService.ts}

  const isReady = await ensureOpenCVReady();
  if (!isReady) {
    console.warn("Skipping OpenCV processing (library not ready).");
    return base64Image;
  }

  try {
    const cv = window.cv;
    const imgElement = await loadImage(base64Image);

    // Read image from DOM element
    const src = cv.imread(imgElement);
    const dst = new cv.Mat();
    
    // Convert to RGB (OpenCV usually reads RGBA from canvas/img)
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);

    // --- STEP 1: Lighting Correction (CLAHE) ---
    // Convert to LAB color space
    const lab = new cv.Mat();
    cv.cvtColor(src, lab, cv.COLOR_RGB2Lab);
    
    // Split channels
    const planes = new cv.MatVector();
    cv.split(lab, planes);
    const lChannel = planes.get(0);

    // Apply CLAHE to L channel
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(lChannel, lChannel);

    // Merge channels back
    lChannel.copyTo(planes.get(0)); // Update the L channel in the vector
    cv.merge(planes, lab);

    // Convert back to RGB
    cv.cvtColor(lab, dst, cv.COLOR_Lab2RGB);

    // Clean up intermediate mats
    lab.delete();
    planes.delete();
    lChannel.delete();
    clahe.delete();

    // --- STEP 2 & 3: Noise Removal & Sharpening (Unsharp Mask) ---
    // We create a blurred version to subtract from original to create a mask
    const blurred = new cv.Mat();
    const ksize = new cv.Size(0, 0); // let sigma determine size
    // Sigma 3 is mild blur for noise reduction
    cv.GaussianBlur(dst, blurred, ksize, 3); 

    // Weighted add: Original * 1.5 + Blurred * -0.5 (Standard Unsharp Mask formula)
    // This sharpens edges while the slight gaussian blur base helped reduce speckle noise
    cv.addWeighted(dst, 1.5, blurred, -0.5, 0, dst);

    // Clean up
    blurred.delete();

    // --- OUTPUT ---
    // Create a temporary canvas to write the Mat back to Base64
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, dst);
    const processedBase64 = canvas.toDataURL('image/jpeg', 0.95);

    // Final cleanup
    src.delete();
    dst.delete();
    
    return processedBase64;

  } catch (error) {
    console.error("OpenCV Processing Error:", error);
    // Fallback to original if processing fails
    return base64Image;
  }
};
