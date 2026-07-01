import { useEffect, useRef, useState } from "react";

/**
 * Wraps the browser's Web Speech API:
 * - speechSynthesis to have the AI interviewer "speak" each question aloud
 * - SpeechRecognition to transcribe the candidate's spoken answer live
 *
 * Falls back gracefully (isSupported=false) on browsers without support,
 * so the interview can still be completed via typed answers.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const SpeechRecognitionAPI =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSupported = typeof window !== "undefined" && !!window.speechSynthesis && !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript + " ";
      }
      setTranscript(finalText.trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speak(text, onEnd) {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      // already started - ignore
    }
  }

  function stopListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }

  function resetTranscript() {
    setTranscript("");
  }

  return {
    isSupported,
    isSpeaking,
    isListening,
    transcript,
    speak,
    startListening,
    stopListening,
    resetTranscript,
  };
}
