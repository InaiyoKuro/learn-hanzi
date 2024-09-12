import { HiMiniSpeakerWave } from "react-icons/hi2";

function TTS({ text }) {

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis is not supported in this browser.");
    }
  };

  return (
     <HiMiniSpeakerWave onClick={speak}/>
  );
}

export default TTS;
