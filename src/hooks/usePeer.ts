import {useCallback, useEffect, useState} from "react";
import Peer, {AnswerOption} from "peerjs";
import useLog from "./useLog";
import {playStream} from "../utils";

export default function usePeer(apiKey: string = "peerjs") {
  const {log, error: logError} = useLog("usePeer");
  const [peer, setPeer] = useState<Peer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [call, setCall] = useState<Peer.MediaConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const peer = new Peer({key: "peerjs"});
    peer.on('open', () => {
      log("open. peer id: " + peer.id);
      setPeer(peer);
    });
    peer.on('error', error => {
      logError(error);
      setError(error);
    });
  }, [log, logError]);

  const listen = useCallback((stream?: MediaStream, options?: AnswerOption) => {
    if (!peer) return;
    log("try listening...", stream, peer, call);

    if (call === null) {
      log('wait for call');
      peer.on('call', call => {
        log('call', call);
        setCall(call);
      });
    } else {
      log('answering');
      call.answer(stream, options);
      call.on('stream', stream => {
        log('on stream', stream);
        setRemoteStream(stream);
        playStream(stream);
      });
    }
  }, [peer, log, call]);

  const startCall = useCallback((peerId: string, stream: MediaStream) => {
    if (peer) {
      log("start call", peerId, stream);
      const remote = peer.call(peerId, stream);
      remote.on('stream', remoteStream => {
        setRemoteStream(stream);
        playStream(remoteStream);
      })
    }
  }, [log, peer]);

  return {peer, id: peer?.id, error, call, listen, startCall, remoteStream};
}
