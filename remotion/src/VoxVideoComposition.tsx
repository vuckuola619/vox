import React from 'react';
import { Sequence, Audio, useVideoConfig, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { KenBurnsImage } from './components/KenBurnsImage';
import { LowerThird } from './components/LowerThird';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { RubberStamp } from './components/RubberStamp';

export interface SceneData {
  sceneIndex: number;
  narrationText: string;
  kineticHeading: string;
  lowerThird?: string;
  highlightWords?: string[];
  transitionStyle?: string;
  audioPath?: string;
  imagePath?: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface VoxVideoCompositionProps {
  title: string;
  topic: string;
  totalDurationSeconds: number;
  masterAudioPath?: string;
  scenes: SceneData[];
}

const SceneWrapper: React.FC<{
  scene: SceneData;
  durationFrames: number;
}> = ({ scene, durationFrames }) => {
  const frame = useCurrentFrame();

  // 15-frame crossfade transition at scene exit
  const fadeOutFrames = 15;
  const opacity = interpolate(
    frame,
    [durationFrames - fadeOutFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const isStampScene = scene.transitionStyle === 'paper_tear' || scene.sceneIndex === 2;

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      {/* 1. HERO VISUAL LAYER: ALWAYS GOOGLE IMAGEN 3 ARTWORK (FULL SCREEN 16:9) */}
      <KenBurnsImage
        imagePath={scene.imagePath}
        durationInFrames={durationFrames}
        transitionStyle={scene.transitionStyle}
      />

      {/* 2. RUBBER STAMP ACCENT */}
      {isStampScene ? (
        <RubberStamp text="CLASSIFIED" />
      ) : null}

      {/* 3. CONDENSED BOLD HEADLINE */}
      {scene.kineticHeading ? (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '0',
            right: '0',
            textAlign: 'center',
            zIndex: 22
          }}
        >
          <h1
            style={{
              fontFamily: 'Oswald, Helvetica Neue, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '46px',
              color: '#1A1A1A',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              backgroundColor: '#EAE1C8',
              display: 'inline-block',
              padding: '6px 20px',
              border: '3px solid #1A1A1A',
              boxShadow: '4px 6px 0px #B92220',
              margin: 0
            }}
          >
            {scene.kineticHeading}
          </h1>
        </div>
      ) : null}

      {/* 4. LOWER THIRD TYPEWRITER BANNER */}
      <LowerThird text={scene.lowerThird} />
    </div>
  );
};

export const VoxVideoComposition: React.FC<VoxVideoCompositionProps> = ({
  masterAudioPath,
  scenes = []
}) => {
  const { fps } = useVideoConfig();

  const getResolvedSrc = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    const cleanPath = src.replace(/\\/g, '/');
    const relativePart = cleanPath.includes('/public/')
      ? cleanPath.split('/public/')[1]
      : cleanPath.startsWith('/')
      ? cleanPath.slice(1)
      : cleanPath;
    try {
      return staticFile(relativePart);
    } catch {
      return src;
    }
  };

  const resolvedMasterAudio = getResolvedSrc(masterAudioPath || "assets/audio/narration_master.mp3");

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#EAE1C8',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Paper Collage Background */}
      <PaperBackground />

      {/* Master Voiceover Narration Track */}
      {resolvedMasterAudio ? <Audio src={resolvedMasterAudio} volume={1.0} /> : null}

      {scenes.map((scene, index) => {
        const startFrame = Math.round(scene.startTime * fps);
        const durationFrames = Math.max(1, Math.round(scene.duration * fps)) + 15;

        return (
          <Sequence
            key={`scene-${scene.sceneIndex}-${index}`}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <SceneWrapper scene={scene} durationFrames={durationFrames} />
          </Sequence>
        );
      })}

      {/* Global Film Grain & Paper Vignette */}
      <FilmGrainOverlay />
    </div>
  );
};
