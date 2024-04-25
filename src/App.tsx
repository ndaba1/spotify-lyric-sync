import { useEffect, useRef, useState } from "react";
import "./App.css";
import { lyrics } from "./lyrics.json";
import clsx from "clsx";

function useDummyAudio(length: number) {
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp((prev) => {
        if (prev >= length) {
          clearInterval(interval);
          return length;
        }
        return prev + 500;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [length]);

  return { timestamp };
}

function useCurrentLine(timestamp: number) {
  type Line = (typeof lyrics.lines)[number];
  const [currentLine, setCurrentLine] = useState<Line | null>(null);

  useEffect(() => {
    const nextLineIndex = lyrics.lines.findIndex(
      (line) => Number(line.startTimeMs) > timestamp
    );

    if (nextLineIndex === 0) {
      setCurrentLine(lyrics.lines[0]);
    }

    setCurrentLine(lyrics.lines[nextLineIndex - 1]);
  }, [timestamp]);

  return { currentLine };
}

function App() {
  const currentLineRef = useRef<HTMLParagraphElement | null>(null);
  const { timestamp } = useDummyAudio(178000);
  const { currentLine } = useCurrentLine(timestamp);

  useEffect(() => {
    if (currentLineRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLine]);

  return (
    <main className="grid gap-5 text-left">
      {lyrics.lines.map((line) => {
        const isCurrentLine = currentLine?.startTimeMs === line.startTimeMs;
        const isPastLine = Number(line.startTimeMs) < timestamp;

        return (
          <p
            ref={isCurrentLine ? currentLineRef : null}
            className={clsx(
              `text-2xl font-bold`,
              isCurrentLine
                ? "text-white"
                : isPastLine
                ? "text-gray-400"
                : "text-black"
            )}
            key={line.startTimeMs}
          >
            {line.words}
          </p>
        );
      })}
    </main>
  );
}

export default App;
