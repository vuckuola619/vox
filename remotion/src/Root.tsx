import React from 'react';
import { Composition } from 'remotion';
import { VoxVideoComposition } from './VoxVideoComposition';
import { VoxShortsComposition } from './VoxShortsComposition';

const defaultProps = {
  title: "The Silent War For Quantum Supremacy",
  topic: "Quantum Supremacy",
  totalDurationSeconds: 60.0,
  totalFrames: 1800,
  fps: 30,
  width: 1920,
  height: 1080,
  masterAudioPath: "assets/audio/narration_master.mp3",
  scenes: [
    {
      sceneIndex: 1,
      narrationText: "March 14, 1987. A quiet laboratory in Silicon Valley. Engineers test a thin piece of purified silicon that would change global power forever.",
      kineticHeading: "THE INITIAL SPARK",
      lowerThird: "FIG 1. SILICON VALLEY, 1987",
      highlightWords: ["1987", "silicon", "power"],
      transitionStyle: "ken_burns_in",
      audioPath: "assets/audio/scene_1_audio.mp3",
      imagePath: "assets/images/scene_1_image.png",
      startTime: 0.0,
      endTime: 9.66,
      duration: 9.66,
      wordTimestamps: [
        { word: "March", startTime: 0.1, endTime: 0.8 },
        { word: "14,", startTime: 0.8, endTime: 1.5 },
        { word: "1987.", startTime: 1.5, endTime: 3.3 }
      ]
    }
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Horizontal Vox Documentary Composition */}
      <Composition
        id="VoxVideo"
        component={VoxVideoComposition as any}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const totalFrames = props?.totalFrames || Math.round((props?.totalDurationSeconds || 60) * 30);
          return {
            durationInFrames: Math.max(300, totalFrames)
          };
        }}
      />

      {/* 9:16 Vertical Vox Shorts / Reels Composition */}
      <Composition
        id="VoxShorts"
        component={VoxShortsComposition as any}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const totalFrames = props?.totalFrames || Math.round((props?.totalDurationSeconds || 60) * 30);
          return {
            durationInFrames: Math.max(300, totalFrames)
          };
        }}
      />
    </>
  );
};
