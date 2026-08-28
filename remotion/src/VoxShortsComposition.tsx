import React from 'react';
import { Sequence, Audio, useVideoConfig, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { KenBurnsImage } from './components/KenBurnsImage';
import { KineticCaptions, WordTiming } from './components/KineticCaptions';
import { LowerThird } from './components/LowerThird';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { RubberStamp } from './components/RubberStamp';
import { SceneData } from './VoxVideoComposition';

export interface VoxShortsCompositionProps {
  title: string;
  topic: string;
  totalDurationSeconds: number;
  masterAudioPath?: string;
  scenes: SceneData[];
}

const ShortsSceneWrapper: React.FC<{
  scene: SceneData;
  durationFrames: number;
}> = ({ scene, durationFrames }) => {
  const frame = useCurrentFrame();

  // Exit crossfade
  const fadeOutFrames = 10;
  const opacity = interpolate(
    frame,
    [durationFrames - fadeOutFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      {/* 1. HERO VISUAL LAYER (VERTICAL COVER FIT FOR SHORTS) */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        <KenBurnsImage
          imagePath={scene.imagePath}
          videoPath={scene.videoPath || scene.imagePath}
          durationInFrames={durationFrames}
          transitionStyle={scene.transitionStyle}
        />
      </div>

      {/* 2. RUBBER STAMP ACCENT */}
      {scene.sceneIndex === 1 || scene.transitionStyle === 'paper_tear' ? (
        <RubberStamp text="CLASSIFIED" />
      ) : null}

      {/* 3. SHORTS TOPIC BADGE */}
      {scene.kineticHeading ? (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '0',
            right: '0',
            textAlign: 'center',
            zIndex: 22
          }}
        >
          <h2
            style={{
              fontFamily: 'Oswald, Helvetica Neue, Arial, sans-serif',
              fontWeight: 700,
              fontSize: '38px',
              color: '#1A1A1A',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(234, 225, 200, 0.95)',
              backdropFilter: 'blur(10px)',
              display: 'inline-block',
              padding: '8px 20px',
              border: '3px solid #1A1A1A',
              borderRadius: '6px',
              boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.3), 4px 6px 0px #B92220',
              margin: 0
            }}
          >
            {scene.kineticHeading}
          </h2>
        </div>
      ) : null}

      {/* 4. LOWER THIRD BANNER */}
      {scene.lowerThird ? <LowerThird text={scene.lowerThird} /> : null}

      {/* 5. CENTERED HIGH-IMPACT KINETIC CAPTIONS FOR SHORTS */}
      <KineticCaptions
        wordTimestamps={scene.wordTimestamps}
        sceneStartTime={scene.startTime}
      />
    </div>
  );
};

export const VoxShortsComposition: React.FC<VoxShortsCompositionProps> = ({
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
      <PaperBackground />
      {resolvedMasterAudio ? <Audio src={resolvedMasterAudio} volume={1.0} /> : null}

      {scenes.map((scene, index) => {
        const startFrame = Math.round(scene.startTime * fps);
        const durationFrames = Math.max(1, Math.round(scene.duration * fps)) + 10;

        return (
          <Sequence
            key={`shorts-scene-${scene.sceneIndex}-${index}`}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <ShortsSceneWrapper scene={scene} durationFrames={durationFrames} />
          </Sequence>
        );
      })}

      <FilmGrainOverlay />
    </div>
  );
};
