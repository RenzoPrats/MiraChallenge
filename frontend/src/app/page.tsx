"use client";
import "./home.css";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [inputInitHeight, setInputInitHeight] = useState(0);
  const chatboxRef = useRef<HTMLUListElement>(null);
  const chatInput = useRef<HTMLTextAreaElement>(null);
  const initialMessage = `Hello! 🌤️ I'm your friendly weather bot here to help you decide if you should go out today. Please tell me the place you'd like to check the weather for in the format "city, country" (e.g., "Paris, France"). I'll let you know if it's a good idea to go out based on the current weather conditions.`;

  /** Create chat message */
  const createChatLi = (message: string, className: string) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent =
      className === "outgoing"
        ? `<p></p>`
        : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p")!.textContent = message;
    return chatLi; // return chat <li> element
  };

  // Generate response using the server
  const generateResponse = (chatElement: HTMLElement, messageValue: string) => {
    const API_URL = "http://localhost:3000/api/chat";
    const messageElement = chatElement.querySelector("p");

    // Define the properties and message for the API request
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: messageValue,
      }),
    };

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions)
      .then((res) => {
        if (!res.ok) {
          // If the response is not OK (e.g., status 500), throw an error
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.message === "good_weather") {
          messageElement!.textContent = `Great news! ☀️ The weather is looking fantastic. It's a perfect day to go outside and enjoy yourself! 🌳🌼 Would you like to check the weather for another place? Just let me know the city and country.`;
        } else {
          messageElement!.textContent = `It looks like the weather isn't too great right now. 🌧️🌪️ It might be best to stay indoors and keep cozy. Would you like to check the weather for another place? Just let me know the city and country.`;
        }
      })
      .catch(() => {
        messageElement!.classList.add("error");
        messageElement!.textContent = `Oops! It seems there was an issue retrieving the weather information for that location. Please make sure you've entered the location in the correct format "city, country" (e.g., "Paris, France") and try again. If the problem persists, double-check the spelling and try another location.`;
      })
      .finally(() => {
        chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);
      });
  };

  // Handle chat when a message is sent
  const handleChat = () => {
    const messageValue = message.trim();
    if (!messageValue) return;

    setMessage("");
    chatInput.current!.style.height = `${inputInitHeight}px`;

    chatboxRef.current?.appendChild(createChatLi(messageValue, "outgoing"));
    chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);

    setTimeout(() => {
      // Display "Thinking..." message while waiting for the response
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatboxRef.current?.appendChild(incomingChatLi);
      chatboxRef.current?.scrollTo(0, chatboxRef.current?.scrollHeight);
      generateResponse(incomingChatLi, messageValue);
    }, 600);
  };

  // Function when chat input change
  const chatInputChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Adjust the height of the input textarea based on its content
    chatInput.current!.style.height = `${inputInitHeight}px`;
    chatInput.current!.style.height = `${chatInput.current!.scrollHeight}px`;
  };

  // function when keydown is pressed
  const chatInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleChat();
    }
  };

  useEffect(() => {
    setInputInitHeight(chatInput.current!.scrollHeight);
  }, []);

  return (
    <div className="main-div">
      <div className="chatbot">
        <header>
          <h2>Mira Weather Chatbot</h2>
          <span className="close-btn material-symbols-outlined">close</span>
        </header>
        <ul className="chatbox" ref={chatboxRef}>
          <li className="chat incoming">
            <span className="material-symbols-outlined">smart_toy</span>
            <p>{initialMessage}</p>
          </li>
        </ul>
        <div className="chat-input">
          <textarea
            ref={chatInput}
            placeholder="Enter a message..."
            required
            value={message}
            onChange={chatInputChanged}
            onKeyDown={chatInputKeyDown}
          ></textarea>
          <span
            id="send-btn"
            className="material-symbols-rounded"
            onClick={handleChat}
          >
            send
          </span>
        </div>
      </div>
    </div>
  );
}
