import axios from "axios";

// Define the Fal.ai API endpoint and the API key
const FAL_AI_API_KEY =
  process.env.NEXT_PUBLIC_FAL_AI_LEY || "your-api-key-here"; // Replace this with actual API key
const API_URL = "https://api.fal-ai.com/v1/images/generate";

// Function to fetch background image from Fal.ai API
export const fetchBackgroundImage = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        prompt: prompt,
        size: "1920x1080", // Size for the background image (matching video resolution)
        style: "space", // Optional: specify the style based on the available ones
      },
      {
        headers: {
          Authorization: `Bearer ${FAL_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl; // Return the image URL from the API response
    } else {
      throw new Error("No image URL returned from the API.");
    }
  } catch (error) {
    console.error("Error fetching background image:", error);
    throw error;
  }
};
