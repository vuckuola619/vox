import React from 'react';
import { Sequence, Audio, useVideoConfig, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { PaperBackground } from './components/PaperBackground';
import { KenBurnsImage } from './components/KenBurnsImage';
import { LowerThird } from './components/LowerThird';
import { FilmGrainOverlay } from './components/FilmGrainOverlay';
import { KineticHeadline } from './components/KineticHeadline';
import { KineticCaptions, WordTiming } from './components/KineticCaptions';
import { WatermarkStamp } from './components/WatermarkStamp';

import { EditorialDustParticles } from './components/EditorialDustParticles';

export interface SceneData {
  sceneIndex: number;
  narrationText: string;
  kineticHeading: string;
  lowerThird?: string;
  highlightWords?: string[];
  transitionStyle?: string;
  audioPath?: string;
  imagePath?: string;
  videoPath?: string;
  startTime: number;
  endTime: number;
  duration: number;
  wordTimestamps?: WordTiming[];
  motionGraphicsOverlay?: any;
}

export interface VoxVideoCompositionProps {
  title?: string;
  topic?: string;
  totalDurationSeconds?: number;
  masterAudioPath?: string;
  cleanEditorialMode?: boolean;
  disableCaptions?: boolean;
  watermarkLabel?: string;
  scenes: SceneData[];
}

const getAdaptiveWatermark = (topic?: string, title?: string, customLabel?: string) => {
  if (customLabel) return customLabel;
  const combined = `${topic || ''} ${title || ''}`.toLowerCase();
  if (
    combined.includes('dark pool') ||
    combined.includes('trading') ||
    combined.includes('finance') ||
    combined.includes('stock') ||
    combined.includes('wall street') ||
    combined.includes('market') ||
    combined.includes('hft')
  ) {
    return 'SEC ARCHIVES · INVESTIGATIVE DOSSIER';
  }
  if (
    combined.includes('nuclear') ||
    combined.includes('onkalo') ||
    combined.includes('megariver') ||
    combined.includes('engineering') ||
    combined.includes('dam') ||
    combined.includes('bridge') ||
    combined.includes('tunnel') ||
    combined.includes('megaproject')
  ) {
    return 'GIGAFORGE · ENGINEERING DOSSIER';
  }
  if (topic) {
    return `${topic.toUpperCase()} · INVESTIGATIVE DOSSIER`;
  }
  return 'VOX ARCHIVES · EDITORIAL DOSSIER';
};

const SceneWrapper: React.FC<{
  scene: SceneData;
  durationFrames: number;
  cleanEditorialMode?: boolean;
}> = ({ scene, durationFrames, cleanEditorialMode = true }) => {
  const frame = useCurrentFrame();

  // 15-frame crossfade transition at scene exit
  const fadeOutFrames = 15;
  const opacity = interpolate(
    frame,
    [durationFrames - fadeOutFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', opacity }}>
      {/* 1. HERO VISUAL LAYER */}
      <KenBurnsImage
        imagePath={scene.imagePath}
        videoPath={scene.videoPath}
        durationInFrames={durationFrames}
        transitionStyle={scene.transitionStyle}
      />

      {/* 2. AMBIENT EDITORIAL DUST PARTICLES */}
      <EditorialDustParticles durationInFrames={durationFrames} />

      {/* 3. KINETIC HEADLINE BANNER (EDITORIAL PAPER STAMP) */}
      <KineticHeadline heading={scene.kineticHeading || "DOCUMENTARY EXPLAINER"} />

      {/* 4. LOWER THIRD TYPEWRITER BANNER */}
      <LowerThird text={scene.lowerThird} />

      {/* 5. DYNAMIC PHONETIC SUBTITLES (Only rendered if cleanEditorialMode is false) */}
      {!cleanEditorialMode && scene.wordTimestamps && (
        <KineticCaptions
          wordTimestamps={scene.wordTimestamps}
          highlightWords={scene.highlightWords}
          sceneStartTime={scene.startTime}
        />
      )}
    </div>
  );
};

export const VoxVideoComposition: React.FC<VoxVideoCompositionProps> = ({
  title,
  topic,
  watermarkLabel,
  masterAudioPath,
  cleanEditorialMode = true,
  disableCaptions = true,
  scenes = []
}) => {
  const { fps } = useVideoConfig();
  const isCleanMode = cleanEditorialMode || disableCaptions;

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

  const resolvedMasterAudio = getResolvedSrc(masterAudioPath);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0F0E0D',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      {/* 6. STATIC AGED PAPER BACKGROUND */}
      <PaperBackground />

      {/* 7. MASTER VOCAL AUDIO LAYER */}
      {resolvedMasterAudio && (
        <Audio
          src={resolvedMasterAudio}
          volume={1.0}
        />
      )}

      {/* 8. SCENE SEQUENCES (KEN BURNS + LIVING GRAPHICS + CAPTIONS) */}
      {scenes.map((scene) => {
        const durationFrames = Math.max(1, Math.round(scene.duration * fps));
        const fromFrame = Math.round(scene.startTime * fps);

        return (
          <Sequence
            key={`scene-${scene.sceneIndex}-${fromFrame}`}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            <SceneWrapper
              scene={scene}
              durationFrames={durationFrames}
              cleanEditorialMode={isCleanMode}
            />
          </Sequence>
        );
      })}

      {/* 9. SUBTLE TACTILE FILM GRAIN (AUTHENTIC 12FPS RETRO FILM TEXTURE) */}
      <FilmGrainOverlay />

      {/* 10. EDITORIAL WATERMARK STAMP */}
      <WatermarkStamp label={getAdaptiveWatermark(topic, title, watermarkLabel)} />
    </div>
  );
};
