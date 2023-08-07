const synth = window.speechSynthesis;
if (!synth) {
    alert("Sorry, your browser doesn't support FreeAAC");
}

function textToSpeech(text) {
    utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}