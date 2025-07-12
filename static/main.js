async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  // Display user message
  chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> ${message}</div>`;
  input.value = "";

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    if (data.response) {
      chatBox.innerHTML += `<div class="chat bot"><strong>Bot:</strong> ${data.response}</div>`;
    } else {
      chatBox.innerHTML += `<div class="chat bot"><strong>Error:</strong> ${data.error || 'Unknown error'}</div>`;
    }

  } catch (err) {
    chatBox.innerHTML += `<div class="chat bot"><strong>Error:</strong> ${err.message}</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
