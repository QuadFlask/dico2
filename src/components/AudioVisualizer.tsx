import {useEffect, useRef, useState} from "react";
import {useRequestAnimationFrame} from "beautiful-react-hooks";

interface AudioVisualizerProps {
  mediaStream: MediaStream | null;
}

export default function AudioVisualizer(props: AudioVisualizerProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // const [analyser, setAnalyser] = useState<AnalyserNode|null>(null);

  useEffect(() => {
    if (props.mediaStream) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const source = audioContext.createMediaStreamSource(props.mediaStream);
      source.connect(analyser);
      dataArrayRef.current = dataArray;
      // setAnalyser(analyser);
      analyserRef.current = analyser;
      return () => {
        analyser.disconnect();
        source.disconnect();
      };
    }
  }, [props.mediaStream]);

  useRequestAnimationFrame((progress, next) => {
    const analyser = analyserRef.current;
    if (analyser && progress % 2 === 0 && dataArrayRef.current) {
      analyser.getByteTimeDomainData(dataArrayRef.current);
      render(ref.current, dataArrayRef.current);
    }
    next();
  }, {increment: 1, finishAt: -1});

  return <canvas ref={ref} width={400} height={200}/>
}

function render(canvas: HTMLCanvasElement | null, data: Uint8Array | null) {
  console.log("render");
  if (canvas && data) {
    const {width, height} = canvas;
    const sliceWidth = width / data.length;
    const context = canvas.getContext('2d')!;

    context.lineWidth = 1;
    context.lineJoin = 'round';
    context.strokeStyle = '#fff';

    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.moveTo(0, height / 2);
    let x = 0;
    for (const item of data) {
      const y = item / 255.0 * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();
  }
}
