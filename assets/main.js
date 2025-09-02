document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
        
  // Handle sending a message
  function sendMessage() {
    
    const message = userInput.value.trim();
    console.log("hell",message);
    if (message) {
      // Create message element
      const msgDiv = document.createElement("div");
      msgDiv.className = "user-message";
      msgDiv.textContent = message;

      // Append to chat box
      chatBox.appendChild(msgDiv);

      // Scroll to bottom
      chatBox.scrollTop = chatBox.scrollHeight;

      // Clear input
      userInput.value = "";
    }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
