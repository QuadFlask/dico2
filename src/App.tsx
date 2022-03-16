import React, {ChangeEvent, useEffect, useState} from 'react';
import styled from "styled-components";
import {useAudioStream, useLog, usePeer, useVersion} from "./hooks";
import AudioVisualizer from "./components/AudioVisualizer";
import Flex from "./components/Flex";

function App() {
  const {logs} = useLog("App");
  const version = useVersion();
  const [targetId, setTargetId] = useState("");
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => setTargetId(e.target.value);

  const {peer, listen, startCall, remoteStream} = usePeer();
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
    <Flex row>
      <Flex>
        localStream
        <AudioVisualizer mediaStream={stream}/>
      </Flex>
      <Flex>
        remoteStream
        <AudioVisualizer mediaStream={remoteStream}/>
      </Flex>
    </Flex>
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
