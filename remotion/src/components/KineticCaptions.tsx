import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
}

interface KineticCaptionsProps {
  wordTimestamps: WordTiming[];
  highlightWords?: string[];
  sceneStartTime?: number;
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  wordTimestamps = [],
  highlightWords = [],
  sceneStartTime = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Convert local frame inside Sequence to global video time
  const currentTime = sceneStartTime + frame / fps;

  if (!wordTimestamps || wordTimestamps.length === 0) {
    return null;
  }

  const firstWordStart = wordTimestamps[0].startTime;
  const lastWordEnd = wordTimestamps[wordTimestamps.length - 1].endTime;

  // Strict scene boundary: Do not render before speech begins or after speech finishes
  if (currentTime < firstWordStart - 0.05 || currentTime > lastWordEnd + 0.1) {
    return null;
  }

  // 1. Group all words in scene into fixed, stable pages of 3 to 4 words max
  const pages: WordTiming[][] = [];
  let currentPage: WordTiming[] = [];

  for (let i = 0; i < wordTimestamps.length; i++) {
    const w = wordTimestamps[i];
    currentPage.push(w);

    const isLastWord = i === wordTimestamps.length - 1;
    const hasPunctuation = /[.,!?;:]$/.test(w.word);
    const nextWordPause = !isLastWord && wordTimestamps[i + 1].startTime - w.endTime > 0.3;
    const pageFull = currentPage.length >= 4;

    if (hasPunctuation || nextWordPause || pageFull || isLastWord) {
      pages.push(currentPage);
      currentPage = [];
    }
  }

  // 2. Find the active page based on currentTime
  let activePage: WordTiming[] | null = null;
  for (const page of pages) {
    const pageStart = page[0].startTime;
    const pageEnd = page[page.length - 1].endTime;

    // Hold page until next page starts or max 0.2s after last word
    if (currentTime >= pageStart - 0.05 && currentTime <= pageEnd + 0.2) {
      activePage = page;
      break;
    }
  }

  if (!activePage || activePage.length === 0) {
    return null; // Clean clear during long pauses between sentences
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '105px',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '0 80px',
        pointerEvents: 'none',
        zIndex: 50
      }}
    >
      {activePage.map((item) => {
        const isWordActive =
          currentTime >= item.startTime - 0.02 && currentTime <= item.endTime + 0.02;

        const isNumericOrStat =
          /\d|\$|%|€|£|tn|bn|mn|nm|km|mile/i.test(item.word) ||
          (highlightWords &&
            highlightWords.some(
              (hw) => item.word.toLowerCase().includes(hw.toLowerCase())
            ));

        let bgColor = '#EAE1C8';
        let textColor = '#221D14';
        let boxShadow = '2px 3px 0px #221D14';
        let transform = 'none';

        if (isWordActive) {
          if (isNumericOrStat) {
            bgColor = '#FFDE59'; // Signature Vox Yellow
            textColor = '#221D14';
            boxShadow = '5px 7px 0px #221D14';
            transform = 'rotate(-1.2deg) scale(1.05)';
          } else {
            bgColor = '#B92220'; // Vox Red
            textColor = '#FFFFFF';
            boxShadow = '4px 6px 0px #221D14';
            transform = 'scale(1.03)';
          }
        }

        return (
          <span
            key={`${item.word}-${item.startTime}`}
            style={{
              fontFamily: 'Special Elite, Courier New, monospace',
              fontSize: '44px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '8px 20px',
              border: '3px solid #221D14',
              backgroundColor: bgColor,
              color: textColor,
              boxShadow: boxShadow,
              transform: transform,
              transition: 'background-color 0.04s ease, color 0.04s ease, transform 0.04s ease'
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
