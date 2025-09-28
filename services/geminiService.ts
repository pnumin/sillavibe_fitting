import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performVirtualTryOn = async (personImage: ImageData, topImage: ImageData | null, bottomImage: ImageData | null): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const parts: any[] = [
      { // Person image is always first
        inlineData: {
          data: personImage.base64,
          mimeType: personImage.mimeType,
        },
      },
    ];

    const clothingItems: string[] = [];
    if (topImage) {
      parts.push({
        inlineData: {
          data: topImage.base64,
          mimeType: topImage.mimeType,
        },
      });
      clothingItems.push('a top');
    }
    if (bottomImage) {
      parts.push({
        inlineData: {
          data: bottomImage.base64,
          mimeType: bottomImage.mimeType,
        },
      });
      clothingItems.push('a bottom');
    }

    const promptText = `The first image is a person. The following image(s) contain ${clothingItems.join(' and ')}. Your task is to realistically render the clothing item(s) onto the person in the first image. Preserve the background of the original person image. The output image must have the same dimensions as the original person image. Output only the final edited image, with no additional text or commentary.`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const firstCandidate = response.candidates?.[0];
    if (firstCandidate) {
        for (const part of firstCandidate.content.parts) {
            if (part.inlineData) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("응답에서 이미지가 생성되지 않았습니다.");

  } catch (error) {
    console.error("Error during virtual try-on:", error);
    if (error instanceof Error) {
        throw new Error(`가상 피팅에 실패했습니다: ${error.message}`);
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
};