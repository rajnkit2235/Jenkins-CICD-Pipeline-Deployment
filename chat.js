function sendMessage() {
    const input = document.getElementById("message");
    const message = input.value.trim();
    if (!message) return;
  
    addMessage("You", message);
    input.value = "";
  
    fetch('support.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'query=' + encodeURIComponent(message)
    })
    .then(response => response.text())
    .then(data => {
      addMessage("AI", data);
    });
  }
  
  function addMessage(sender, text) {
    const chat = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.textContent = `${sender}: ${text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
  