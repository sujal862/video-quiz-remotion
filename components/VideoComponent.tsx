"use client";

import React, { useEffect, useState } from "react";
import { useVideoConfig, Audio, Img, useCurrentFrame } from "remotion";
import { generateBackgroundImage } from "@/utils/generateBackground";
import { Button } from "@/components/ui/button";

interface QuizRendererProps {
  quizTitle: string;
  background: string | null;
  themeColor: string;
  font: string;
  countries: string[];
  audioUrls?: {
    intro?: string;
    nextQuestion?: string;
    reveals?: string[];
    outro?: string;
  };
  onExport?: () => void;
  isPreview?: boolean;
}

interface AudioState {
  currentAudio: string | null;
  isLoading: boolean;
  error: string | null;
}

interface GameState {
  phase:
    | "intro"
    | "question-intro"
    | "question"
    | "countdown"
    | "reveal"
    | "outro";
  message: string;
}

export const QuizRenderer: React.FC<QuizRendererProps> = ({
  quizTitle,
  background,
  themeColor,
  font,
  countries,
  audioUrls,
  onExport,
  isPreview = true,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const [scrambled, setScrambled] = useState("");
  const [currentCountryIndex, setCurrentCountryIndex] = useState(-1);
  const [timer, setTimer] = useState(3);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(background);
  const [answeredCountries, setAnsweredCountries] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    phase: "intro",
    message: "Hello! Can you unscramble 10 countries? Let's go!",
  });
  const [audioState, setAudioState] = useState<AudioState>({
    currentAudio: null,
    isLoading: false,
    error: null,
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        if (!backgroundUrl) {
          const { backgroundImageUrl } = await generateBackgroundImage();
          setBackgroundUrl(backgroundImageUrl);
        }

        // Play intro audio
        if (audioUrls?.intro) {
          setAudioState((prev) => ({
            ...prev,
            currentAudio: audioUrls.intro || null,
          }));
        }

        // Move to first question after intro
        setTimeout(() => {
          setGameState({
            phase: "question-intro",
            message: "Here's the first one, let's go!",
          });
          setCurrentCountryIndex(0);
        }, 3000);
      } catch (error) {
        console.error("Initialization failed:", error);
        setAudioState((prev) => ({ ...prev, error: "Initialization failed" }));
      }
    };

    initializeVideo();
  }, [backgroundUrl, audioUrls]);

  // Handle game state progression
  useEffect(() => {
    if (gameState.phase === "question-intro") {
      // Show "Here's the next one" message
      if (audioUrls?.nextQuestion) {
        setAudioState((prev) => ({
          ...prev,
          currentAudio: audioUrls.nextQuestion || null,
        }));
      }

      // Move to question after 2 seconds
      setTimeout(() => {
        const country = countries[currentCountryIndex];
        const shuffled = country
          .split("")
          .sort(() => 0.5 - Math.random())
          .join("");
        setScrambled(shuffled);
        setGameState({
          phase: "question",
          message: shuffled,
        });
      }, 2000);
    }

    if (gameState.phase === "question") {
      // Start countdown after 0.5 seconds of showing scrambled word
      setTimeout(() => {
        setGameState({
          phase: "countdown",
          message: scrambled,
        });

        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              setGameState({
                phase: "reveal",
                message: `It's ${countries[currentCountryIndex]}!`,
              });
              if (audioUrls?.reveals?.[currentCountryIndex]) {
                setAudioState((prev) => ({
                  ...prev,
                  currentAudio: audioUrls.reveals[currentCountryIndex] || null,
                }));
              }
              return 3;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }, 500);
    }

    if (gameState.phase === "reveal") {
      setAnsweredCountries((prev) => [...prev, countries[currentCountryIndex]]);

      // Move to next question or outro
      setTimeout(() => {
        if (currentCountryIndex < countries.length - 1) {
          setCurrentCountryIndex((prev) => prev + 1);
          setGameState({
            phase: "question-intro",
            message: "Here's the next one!",
          });
        } else {
          setGameState({
            phase: "outro",
            message: "Thank you for playing! Comment below with your score!",
          });
          if (audioUrls?.outro) {
            setAudioState((prev) => ({
              ...prev,
              currentAudio: audioUrls.outro || null,
            }));
          }
        }
      }, 2000);
    }
  }, [gameState.phase, currentCountryIndex, countries, audioUrls, scrambled]);

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: "28px",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: font,
        color: themeColor,
      }}
      className=" rounded-[28px] flex align-center to-black"
    >
      {backgroundUrl && (
        <Img
          src={backgroundUrl}
          style={{
            width: "37%",
            height: "32%",
            objectFit: "cover",
            position: "absolute",
            borderRadius: "28px",
            top: 0,
            left: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        />
      )}

      {/* Numbers column on the left */}
      <div className="absolute left-8 top-[120px] flex flex-col space-y-4 z-10">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold">
              {i + 1}
            </div>
            {answeredCountries[i] && (
              <div 
                className={`px-4 py-1 rounded-md text-white font-medium animate-fadeIn ${
                  i % 5 === 0
                    ? "bg-red-500"
                    : i % 5 === 1
                    ? "bg-green-500"
                    : i % 5 === 2
                    ? "bg-blue-500"
                    : i % 5 === 3
                    ? "bg-yellow-500"
                    : "bg-purple-500"
                }`}
              >
                {answeredCountries[i]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-[10px] z-10 w-[400px] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold bg-white text-red-400 px-4 rounded-md mt-2 text-center mb-2">
          {quizTitle}
        </h1>

        <div className="space-y-0">
          <h2
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)" }}
            className="text-[14px] font-bold text-center"
          >
            {gameState.message}
          </h2>
          {gameState.phase === "countdown" && (
            <h3 className="text-lg text-center mt-2">{timer}</h3>
          )}
        </div>
      </div>

      {gameState.phase !== "intro" && gameState.phase !== "outro" && (
        <div className="absolute bottom-8 w-full text-center text-lg">
          {currentCountryIndex + 1} / 10
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-20">
        <Button
          onClick={async () => {
            try {
              const video = document.querySelector('video');
              if (!video) return;
              
              // Create a MediaRecorder to capture the video
              const stream = video.captureStream();
              const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm'
              });
              
              const chunks: BlobPart[] = [];
              mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
              mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'quiz-video.webm';
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
              };
              
              // Start recording
              mediaRecorder.start();
              
              // Play the video
              await video.play();
              
              // Stop recording after the video duration
              setTimeout(() => {
                mediaRecorder.stop();
                video.pause();
              }, (300 / 30) * 1000); // Duration in frames / fps * 1000 for milliseconds
            } catch (error) {
              console.error('Failed to export video:', error);
            }
          }}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
        >
          Export Video
        </Button>
      </div>

      {audioState.currentAudio && !audioState.error && (
        <Audio src={audioState.currentAudio} startFrom={0} />
      )}
    </div>
  );
};

export default QuizRenderer;
