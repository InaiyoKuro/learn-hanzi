import { HiMiniSpeakerWave } from "react-icons/hi2";

function TTS({ text }) {

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";

      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech Synthesis is not supported in this browser.");
    }
  };

  return (
     <HiMiniSpeakerWave onClick={speak}/>
  );
}

export default TTS;
