import Peer, {AnswerOption} from 'peerjs';
import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';

function usePeer(apiKey: string = "peerjs") {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [call, setCall] = useState<Peer.MediaConnection | null>(null);

  useEffect(() => {
    const peer = new Peer({key: "peerjs"});
    peer.on('open', () => {
      console.log("open. peer id: " + peer.id);
      setPeer(peer);
    });
    peer.on('error', error => {
      console.error(error);
      setError(error);
    });
  }, []);

  const listen = useCallback((stream?: MediaStream, options?: AnswerOption) => {
    if (!peer) return;
    console.log("try listening...", stream, peer, call);

    if (call === null) {
      console.log('wait for call');
      peer.on('call', call => {
        console.log('call', call);
        setCall(call);
      });
    } else {
      console.log('answering');
      call.answer(stream, options);
      call.on('stream', stream => {
        console.log('on stream', stream);
        playStream(stream);
      });
    }
  }, [peer, call]);

  const startCall = useCallback((peerId: string, stream: MediaStream) => {
    if (peer) {
      console.log("start call", peerId, stream);
      const remote = peer.call(peerId, stream);
      remote.on('stream', remoteStream => {
        playStream(remoteStream);
      })
    }
  }, [peer]);

  return {peer, id: peer?.id, error, call, listen, startCall};
}

function useAudioStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAudioAccess = useCallback(() => {
    navigator.getUserMedia({audio: true, video: false}, stream => {
      console.log("stream ok");
      setStream(stream);
    }, error => {
      console.error(error);
      setError(error)
    });
  }, []);

  return {stream, error, requestAudioAccess};
}

function App() {
  const [targetId, setTargetId] = useState("");
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => setTargetId(e.target.value);

  const {peer, listen, startCall} = usePeer();
  const {stream, requestAudioAccess} = useAudioStream();

  useEffect(() => {
    requestAudioAccess();
  }, [requestAudioAccess]);

  useEffect(() => {
    if (stream) listen(stream);
  }, [listen, stream]);

  return <div className="App">
    <div>
      my Id:
      <button onClick={e => peer?.id && navigator.clipboard.writeText(peer.id)}>{peer?.id}</button>
    </div>
    <div>
      connect: <input onChange={handleInput}/>
      <button onClick={() => {
        if (stream) {
          startCall(targetId, stream);
        } else {
          console.error("no stream!");
        }
      }}>startCall
      </button>
    </div>
    <audio autoPlay id="#audio"/>
  </div>
}

export default App;

function playStream(stream: MediaStream) {
  console.log("play stream");
  let audio = new Audio();
  audio.srcObject = stream;
  audio.play();
}
