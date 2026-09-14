<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Nova AI</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #05070d;
      color: white;
      font-family: Arial, sans-serif;
      min-height: 100vh;
    }

    .app {
      width: 100%;
      max-width: 700px;
      min-height: 100vh;
      margin: auto;
      display: flex;
      flex-direction: column;
    }

    header {
      padding: 24px 20px 15px;
      text-align: center;
      border-bottom: 1px solid #202532;
    }

    .logo {
      font-size: 30px;
      font-weight: bold;
      color: #ffffff;
    }

    .subtitle {
      margin-top: 6px;
      color: #8f98aa;
      font-size: 14px;
    }

    #chat {
      flex: 1;
      padding: 22px 16px 150px;
      overflow-y: auto;
    }

    .message {
      max-width: 88%;
      padding: 14px 17px;
      margin: 10px 0;
      border-radius: 18px;
      line-height: 1.5;
      font-size: 16px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .nova {
      background: #151b27;
      margin-right: auto;
      border-bottom-left-radius: 5px;
    }

    .user {
      background: #078b99;
      margin-left: auto;
      border-bottom-right-radius: 5px;
    }

    .bottom {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #080b13;
      border-top: 1px solid #202532;
      padding: 12px;
    }

    .bottom-inner {
      max-width: 700px;
      margin: auto;
    }

    .input-row {
      display: flex;
      gap: 8px;
    }

    #input {
      flex: 1;
      min-width: 0;
      background: #121824;
      color: white;
      border: 1px solid #293142;
      border-radius: 15px;
      padding: 15px;
      font-size: 16px;
      outline: none;
    }

    button {
      border: none;
      cursor: pointer;
      color: white;
      font-size: 20px;
      border-radius: 14px;
    }

    #micBtn {
      width: 58px;
      background: #743cff;
    }

    #sendBtn {
      width: 62px;
      background: #08a6b7;
    }

    .quick-buttons {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      margin-top: 10px;
      padding-bottom: 3px;
    }

    .quick-buttons button {
      flex-shrink: 0;
      background: #151c2a;
      padding: 10px 15px;
      font-size: 13px;
    }

    #status {
      text-align: center;
      margin-top: 9px;
      font-size: 13px;
      color: #62d9a2;
    }

    .typing {
      opacity: 0.7;
    }

    @media (max-width: 500px) {
      .logo {
        font-size: 26px;
      }

      .message {
        max-width: 92%;
      }
    }
  </style>
</head>

<body>

<div class="app">

  <header>
    <div class="logo">Nova AI</div>
    <div class="subtitle">Your personal AI Assistant</div>
  </header>

  <main id="chat">

    <div class="message nova">
      Hello! I'm Nova. Ask me anything. You can type or use the microphone.
    </div>

  </main>

  <div class="bottom">

    <div class="bottom-inner">

      <div class="input-row">

        <input
          id="input"
          type="text"
          placeholder="Ask Nova anything..."
          autocomplete="off"
        >

        <button id="micBtn" title="Speak">🎙️</button>

        <button id="sendBtn" title="Send">➤</button>

      </div>

      <div class="quick-buttons">

        <button onclick="quickAsk('What is the time?')">
          Time
        </button>

        <button onclick="quickAsk('What is today\\'s date?')">
          Date
        </button>

        <button onclick="quickAsk('Tell me a joke.')">
          Joke
        </button>

        <button onclick="quickAsk('Open YouTube')">
          YouTube
        </button>

        <button onclick="quickAsk('Open WhatsApp')">
          WhatsApp
        </button>

      </div>

      <div id="status">
        Nova is ready
      </div>

    </div>

  </div>

</div>

<script>

  const input = document.getElementById("input");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const chat = document.getElementById("chat");
  const status = document.getElementById("status");

  /*
    This stores the latest Gemini interaction.

    It allows Nova to continue the same conversation
    by sending previousInteractionId to /api/chat.
  */

  let previousInteractionId =
    localStorage.getItem("novaInteractionId") || null;


  function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = "message " + type;

    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

    return message;
  }


  function setStatus(text, error = false) {

    status.textContent = text;

    status.style.color =
      error ? "#ff6b6b" : "#62d9a2";
  }


  async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");

    input.value = "";

    setStatus("Nova is thinking...");

    const thinking = addMessage(
      "Thinking...",
      "nova"
    );

    thinking.classList.add("typing");


    try {

      const response = await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: text,

          /*
            Send the previous Gemini interaction
            so Nova can remember the conversation.
          */

          previousInteractionId:
            previousInteractionId

        })

      });


      const data = await response.json();


      if (!response.ok) {

        console.error("Nova API error:", data);

        throw new Error(
          data.error || "Server error"
        );
      }


      thinking.remove();


      const reply =
        data.reply ||
        "I couldn't generate a response.";


      addMessage(reply, "nova");


      /*
        Save the new interaction ID.

        The next message will use this ID,
        allowing Gemini to continue the conversation.
      */

      if (data.interactionId) {

        previousInteractionId =
          data.interactionId;

        localStorage.setItem(
          "novaInteractionId",
          data.interactionId
        );

      }


      setStatus("Nova is ready");


    } catch (error) {

      console.error(error);

      thinking.remove();

      addMessage(
        "I couldn't connect to my AI brain right now. Please check the server.",
        "nova"
      );

      setStatus(
        "Connection problem",
        true
      );

    }

  }


  function quickAsk(text) {

    input.value = text;

    sendMessage();

  }


  sendBtn.addEventListener(
    "click",
    sendMessage
  );


  input.addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {

        sendMessage();

      }

    }
  );


  /*
    Voice recognition
  */

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (SpeechRecognition) {

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    micBtn.addEventListener(
      "click",
      function() {

        setStatus("Listening...");

        recognition.start();

      }
    );


    recognition.onresult =
      function(event) {

        const text =
          event.results[0][0].transcript;

        input.value = text;

        setStatus("Nova is ready");

        sendMessage();

      };


    recognition.onerror =
      function() {

        setStatus(
          "Microphone problem",
          true
        );

      };


    recognition.onend =
      function() {

        if (
          status.textContent ===
          "Listening..."
        ) {

          setStatus("Nova is ready");

        }

      };

  } else {

    micBtn.addEventListener(
      "click",
      function() {

        alert(
          "Voice recognition is not supported by this browser."
        );

      }
    );

  }


  /*
    Speak Nova's answers aloud.

    This is kept simple so it works with
    the phone browser's speech engine.
  */

  const originalAddMessage =
    addMessage;


  function speakNova(text) {

    if (
      !("speechSynthesis" in window)
    ) {

      return;

    }

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );

  }

</script>

</body>
</html>
