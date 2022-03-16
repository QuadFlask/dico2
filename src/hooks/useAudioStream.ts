import {useCallback, useState} from "react";
import useLog from "./useLog";

export default function useAudioStream() {
  const {log, error: logError} = useLog("useAudioStream");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAudioAccess = useCallback(() => {
    navigator.getUserMedia({audio: true, video: false}, stream => {
      log("stream ok");
      setStream(stream);
    }, error => {
      logError(error);
      setError(error)
    });
  }, [log, logError]);

  return {stream, error, requestAudioAccess};
}
