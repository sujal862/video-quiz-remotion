import * as fal from "@fal-ai/serverless-client";

// Initialize fal client with type safety for environment variable
if (!process.env.NEXT_PUBLIC_FAL_AI_KEY) {
  throw new Error("FAL API key not found in environment variables");
}

fal.config({
  credentials: process.env.NEXT_PUBLIC_FAL_AI_KEY,
});

// Define types for video content
type ImageSize = "portrait_16_9" | "square_1_1" | "landscape_16_9";

interface Caption {
  text: string;
  startTime: number;
  duration: number;
}

interface VideoContent {
  title: string;
  captions: Caption[];
  countries: string[];
  voiceoverText: string;
}

interface GenerateVideoOptions {
  prompt?: string;
  negative_prompt?: string;
  image_size?: ImageSize;
  num_images?: number;
  videoContent?: VideoContent;
}

// Default video content
const defaultVideoContent: VideoContent = {
  title: "Country Scramble Quiz",
  captions: [
    {
      text: "Can you name these 10 scrambled countries?",
      startTime: 0,
      duration: 2.5,
    },
    {
      text: "First one, let's go!",
      startTime: 2.5,
      duration: 1.5,
    },
  ],
  countries: [], // Will be populated with randomized countries
  voiceoverText:
    "Can you name these 10 scrambled countries? First one, let's go!",
};

export const generateBackgroundImage = async (
  options: GenerateVideoOptions = {}
) => {
  const {
    prompt = "Astronaut exploring galaxies in a vibrant universe, highly detailed space background",
    negative_prompt = "text, watermark, low quality, blurry",
    image_size = "portrait_16_9",
    num_images = 1,
    videoContent = defaultVideoContent,
  } = options;

  try {
    // Generate background image
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
      input: {
        prompt,
        negative_prompt,
        image_size,
        num_images,
      },
    });

    if (!result.images?.[0]?.url) {
      throw new Error("No image generated");
    }

    // Return both the background image URL and video content
    return {
      backgroundImageUrl: result.images[0].url,
      videoContent: videoContent,
    };
  } catch (error) {
    console.error("Failed to generate video content:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};

// Helper function to generate captions for countries
export const generateCountryCaptions = (countries: string[]): Caption[] => {
  let startTime = 4; // Start after initial captions
  const captions: Caption[] = [];

  countries.forEach((country, index) => {
    // Add scrambled country caption
    captions.push({
      text: scrambleWord(country),
      startTime,
      duration: 3,
    });

    // Add reveal caption
    captions.push({
      text: country,
      startTime: startTime + 3,
      duration: 1.5,
    });

    // Add transition caption if not the last country
    if (index < countries.length - 1) {
      captions.push({
        text: `${getOrdinal(index + 2)} one!`,
        startTime: startTime + 4.5,
        duration: 1,
      });
    }

    startTime += 5.5; // Move to next country timing
  });

  return captions;
};

// Helper function to scramble a word
const scrambleWord = (word: string): string => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Helper function to get ordinal numbers
const getOrdinal = (n: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};
