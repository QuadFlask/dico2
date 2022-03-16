export function playStream(stream: MediaStream) {
  console.log("play stream");
  let audio = new Audio();
  audio.srcObject = stream;
  audio.play();
}
