export {};

declare global {
  type Song = {
    artist: string;
    albumImageUrl: string;
    isPlaying: boolean;
    songUrl: string;
    title: string;
    message: string;
  };

  type Garden = {
    title: string;
    description: string;
    tags: string[];
    slug: string;
  };

  type P5jsContainerRef = HTMLDivElement;

  type P5jsSketch = (p: p5Types, parentRef: P5jsContainerRef) => void;

  type P5jsContainer = ({
    sketch,
  }: {
    sketch: P5jsSketch;
  }) => React.JSX.Element;
}
