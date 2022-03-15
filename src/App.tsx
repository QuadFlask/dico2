import Peer, {AnswerOption} from 'peerjs';
import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {useQuery} from "react-query";
import {atom, useRecoilState, useSetRecoilState} from "recoil";
import styled from "styled-components";

function usePeer(apiKey: string = "peerjs") {
  const {log, error: logError} = useLog("usePeer");
  const [peer, setPeer] = useState<Peer | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [call, setCall] = useState<Peer.MediaConnection | null>(null);

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
  }, []);

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
        playStream(stream);
      });
    }
  }, [peer, call]);

  const startCall = useCallback((peerId: string, stream: MediaStream) => {
    if (peer) {
      log("start call", peerId, stream);
      const remote = peer.call(peerId, stream);
      remote.on('stream', remoteStream => {
        playStream(remoteStream);
      })
    }
  }, [peer]);

  return {peer, id: peer?.id, error, call, listen, startCall};
}

function useAudioStream() {
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
  }, []);

  return {stream, error, requestAudioAccess};
}

function App() {
  const {logs} = useLog("App");
  const version = useVersion();
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
    version: {version}
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
    <hr/>
    <div>
      {logs.map((log, i) => <LogLine key={i}>{log}</LogLine>)}
    </div>
  </div>
}

const LogLine = styled.pre`
  margin: 0;
  color: white;
`;

export default App;

function playStream(stream: MediaStream) {
  console.log("play stream");
  let audio = new Audio();
  audio.srcObject = stream;
  audio.play();
}

function useVersion() {
  const {isLoading, error, data} = useQuery('app-version', () => fetch(`asset-manifest.json`).then(r => r.json()));
  return isLoading ? '...' : error ? 'error' : data;
}

const atoms = {
  logs: atom<string[]>({
    key: 'logs',
    default: [],
  }),
};

function useLog(prefix: string = "") {
  const [logs, setLogs] = useRecoilState(atoms.logs);
  const updateLogs = useSetRecoilState(atoms.logs); // TODO setLogs what's difference?

  const log = useCallback((...args: any[]) => {
    const newLog = `${new Date().toISOString()} [INFO]  [${prefix}]\t: ` + args.toString();
    updateLogs(logs => ([...logs, newLog]));
    console.log(...args);
  }, [prefix, updateLogs]);
  const error = useCallback((...args: any[]) => {
    const newLog = `${new Date().toISOString()} [ERROR] [${prefix}]\t: ` + args.toString();
    updateLogs(logs => ([...logs, newLog]));
    console.error(...args);
  }, [prefix, updateLogs]);

  return {logs, log, error};
}
