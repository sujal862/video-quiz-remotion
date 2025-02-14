import axios from "axios";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchVoiceover = async (text: string, retries = 3) => {
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  for (let i = 0; i < retries; i++) {
    try {
      // Add increasing delay between retries
      await delay(1000 * (i + 1));

      const response = await axios.post(
        "https://api.elevenlabs.io/v1/text-to-speech/IKne3meq5aSn9XLyUdCD?output_format=mp3_44100_128",
        {
          text: text,
          model_id: "eleven_multilingual_v2",
        },
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          responseType: "blob", // Important for handling audio data
        }
      );

      // Convert blob to URL
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      return URL.createObjectURL(audioBlob);
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error.message);

      // If it's a rate limit error (429), wait longer
      if (error.response?.status === 429) {
        await delay(2000 * (i + 1));
        continue;
      }

      // On last retry, throw the error
      if (i === retries - 1) {
        throw error;
      }
    }
  }
};
