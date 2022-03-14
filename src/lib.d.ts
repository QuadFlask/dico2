interface Navigator {
  getUserMedia(
      options: { video?: bool; audio?: bool; },
      success: (stream: any) => void,
      error?: (error: string) => void
  ): void;
}

navigator.getUserMedia(
    {video: true, audio: true},
    function (stream) {
    },
    function (error) {
    }
);
