import { GoogleGenAI } from "@google/genai";
import { LENS_MASTER_SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisMode } from "../types";

// Initialize the API client
// Note: We use a getter or re-instantiation in functions to ensure we always pick up the latest env var if it changes (though usually static in this context)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the image using Gemini 2.5 Flash Image model.
 */
export const analyzeImage = async (
  base64Image: string,
  mode: AnalysisMode
): Promise<string> => {
  const ai = getAiClient();
  
  // Clean base64 string if it has prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  let prompt = "Please analyze this image.";
  if (mode === AnalysisMode.MASTERPIECE) {
    prompt = "Please analyze this image using 'Mode 1: Masterpiece Analysis'.";
  } else if (mode === AnalysisMode.CRITIQUE) {
    prompt = "Please analyze this image using 'Mode 2: Critique & Improve'.";
  } else {
    prompt = "Analyze this image. Decide automatically whether to use Mode 1 (Masterpiece) or Mode 2 (Critique) based on the photo quality.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: LENS_MASTER_SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative but grounded analysis
      }
    });

    return response.text || "No analysis generated.";
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze image.");
  }
};

/**
 * Generates an improved version of the image based on the original and the critique.
 */
export const generateImprovedImage = async (
  originalBase64: string,
  analysisText: string
): Promise<string | null> => {
  const ai = getAiClient();
  const cleanBase64 = originalBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  // 1. First, we need to ask Gemini to formulate a precise image generation prompt 
  // based on the original image content + the improvements suggested in the analysis text.
  // We can do this with flash-image as well.
  
  let generationPrompt = "";
  try {
    const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                { text: `Based on the following critique:\n\n${analysisText}\n\nWrite a detailed prompt to generate a new, improved version of this photo that fixes the issues mentioned (exposure, composition, etc) while keeping the subject and scene similar. output ONLY the prompt.`}
            ]
        }
    });
    generationPrompt = promptResponse.text || "A high quality photography version of the provided image.";
  } catch (e) {
      console.warn("Failed to generate optimized prompt, falling back to generic.", e);
      generationPrompt = "A professional, high-quality version of the attached image with perfect composition and lighting.";
  }

  // 2. Now generate the actual image using the optimized prompt.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using flash-image for generation capabilities
      contents: {
        parts: [
            // We provide the original image as a reference if possible, or just the text. 
            // Providing the image as reference helps keep identity.
             {
                inlineData: {
                  mimeType: 'image/jpeg', 
                  data: cleanBase64
                }
              },
             { text: `Generate a new photo based on this image but apply these improvements: ${generationPrompt}` }
        ]
      },
      config: {
          // No specific image generation config exposed in this simple call pattern for flash-image 
          // other than the prompt itself guiding the generation.
          // However, we want to ensure we get an image back.
      }
    });

    // Extract image from response
    // The response might contain multiple parts (text explanation + image), or just image.
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    return null;
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    // Don't throw here, just return null so the UI shows the text analysis at least.
    return null; 
  }
};
