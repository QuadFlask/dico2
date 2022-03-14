import Peer from 'peerjs';
import React, {ChangeEvent, useState} from 'react';




const peer = new Peer({key: "peerjs"});
peer.on('open', () => {
  console.log("peer id: " + peer.id);
})
peer.on('error', console.error);

function startCall(peerId: string) {
  console.log("startCall", peerId);
  navigator.getUserMedia({audio: true, video: false}, stream => {
    const call = peer.call(peerId, stream);
    call.on('stream', remoteStream => {
      console.log("on stream", remoteStream);
      playStream(remoteStream);
    });
  }, console.error);
}

function answerCall() {
  console.log("wait for call...");
  peer.on('call', call => {
    console.log(call);
    navigator.getUserMedia({audio: true, video: false}, stream => {
      call.answer(stream);
      console.log("answering", stream)
      call.on('stream', remoteStream => {
        console.log("on stream", remoteStream);
        playStream(remoteStream);
      });
    }, console.error);
  });
}

function App() {
  const [id, setId] = useState("");
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }

  return <div className="App">
    <input onChange={handleInput}/>
    <button onClick={() => startCall(id)}>startCall</button>
    <button onClick={answerCall}>answerCall</button>
    <audio autoPlay id="#audio"/>
    {/*<button onClick={() => requestAccess()}>request</button>*/}
  </div>
}

export default App;

function playStream(stream: MediaStream) {
  let audio = new Audio();
  audio.srcObject = stream;
  audio.play();
}
