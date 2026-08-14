import React from 'react';
import { Sequence, Audio, useVideoConfig, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { KenBurnsImage } from './components/KenBurnsImage';
import { LowerThird } from './components/LowerThird';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { VoxMotionOverlay } from './components/VoxMotionOverlay';
import { RubberStamp } from './components/RubberStamp';
import { RedStringConnect } from './components/RedStringConnect';
import { VoxChartAnimation } from './components/VoxChartAnimation';
import { VoxMapAnimation } from './components/VoxMapAnimation';
import { TapeFragments } from './components/TapeFragments';
import { RedMarkerOverlay } from './components/RedMarkerOverlay';
import { AlertWash } from './components/AlertWash';
import { LivingPuppet } from './components/LivingPuppet';
import { KineticHeadline } from './components/KineticHeadline';
import { WatermarkStamp } from './components/WatermarkStamp';

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
  motionGraphicsOverlay?: any;
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

  const overlayType = scene.motionGraphicsOverlay?.type;
  const isStampScene = overlayType === 'stamp' || scene.motionGraphicsOverlay?.stampText;
  const isRedStringScene = overlayType === 'red_string' || scene.motionGraphicsOverlay?.redString;
  const isAlertWashScene = overlayType === 'alert_wash' || scene.motionGraphicsOverlay?.alertWash;
  const isPuppetScene = overlayType === 'living_puppet' || scene.motionGraphicsOverlay?.gesture;
  const stampText = scene.motionGraphicsOverlay?.stampText || (isStampScene ? "CLASSIFIED" : undefined);

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      {/* 1. HERO VISUAL LAYER: GOOGLE IMAGEN 3 / 9ROUTER ARTWORK (ALWAYS 100% CLEAN FULL SCREEN 16:9) */}
      <KenBurnsImage
        imagePath={scene.imagePath}
        durationInFrames={durationFrames}
        transitionStyle={scene.transitionStyle}
      />

      {/* 2. PAPER MASKING TAPE FRAGMENTS */}
      <TapeFragments />

      {/* 3. DYNAMIC ANIMATED VOX MAP & MOTION GRAPHICS OVERLAY */}
      <VoxMotionOverlay
        config={scene.motionGraphicsOverlay}
        durationInFrames={durationFrames}
      />

      {/* 4. RED STRING & BRASS PINS OVERLAY */}
      {isRedStringScene ? <RedStringConnect /> : null}

      {/* 5. PAPER MARIONETTE PUPPET (STOP-MOTION) */}
      {isPuppetScene ? (
        <LivingPuppet gesture={scene.motionGraphicsOverlay?.gesture || "arm_point"} />
      ) : null}

      {/* 6. RUBBER STAMP ACCENT */}
      {isStampScene && stampText ? (
        <RubberStamp text={stampText} />
      ) : null}

      {/* 7. ALERT WASH DRAMATIC FLOOD */}
      <AlertWash active={isAlertWashScene} />

      {/* 8. KINETIC HEADLINE BANNER (EDITORIAL PAPER STAMP) */}
      <KineticHeadline heading={scene.kineticHeading} />

      {/* 9. LOWER THIRD TYPEWRITER BANNER */}
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

      {/* Global Vox Studio Watermark Stamp */}
      <WatermarkStamp />
    </div>
  );
};
