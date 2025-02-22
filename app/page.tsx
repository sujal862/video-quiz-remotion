'use client'
import { useState } from "react";
import { Player } from "@remotion/player";
import { RemotionRoot } from "../components/RemotionRoot";
import QuizCustomizer from "@/components/QuizCustomizer";
import QuizRenderer from "@/components/VideoComponent";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [quizConfig, setQuizConfig] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleQuizGenerated = (config: any) => {
    setQuizConfig(config);
  };

  const handleExport = async () => {
    if (!quizConfig) return;
    
    try {
      // Use the Remotion Player's imperative API to render
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
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
      <RemotionRoot />

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            {/* <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Video Quiz Generator
            </h1> */}
            {/* <p className="text-muted-foreground max-w-[600px] mx-auto">
              Create engaging video quizzes with AI-powered animations and customizable templates.
            </p> */}
          </div>

          {/* Main Content */}
          <Card className="border-none bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customizer Section */}
                <div className="w-full max-w-2xl mx-auto lg:max-w-none px-[20px]">
                  <h2 className="text-2xl font-semibold mb-6">Customize Your Quiz</h2>
                  <QuizCustomizer onQuizGenerated={handleQuizGenerated} />
                </div>

                {/* Preview Section */}
                <div className="w-full flex flex-col items-center justify-start">
                  <h2 className="text-2xl font-semibold mb-6">Preview</h2>
                  {quizConfig ? (
                    <div className="relative aspect-[9/16] h-[600px] w-[400px] rounded-2xl overflow-hidden shadow-lg">
                      <Player
                        component={QuizRenderer}
                        inputProps={{
                          ...quizConfig,
                          onExport: handleExport,
                          isPreview: true
                        }}
                        durationInFrames={300}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        controls
                        autoPlay
                        loop
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[600px] w-[400px] rounded-2xl bg-muted/50">
                      <p className="text-muted-foreground text-center px-4">
                        Customize your quiz settings to see the preview here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
