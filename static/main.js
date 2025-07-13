// Function to convert markdown to HTML
function markdownToHtml(text) {
  // Convert newlines to <br> tags
  let html = text.replace(/\n/g, '<br>');
  
  // Remove OpenAI citation markers entirely - remove 【5:7†source】 completely
  html = html.replace(/【\d+:\d+†source】/g, '');
  
  // Convert **bold** to <strong> tags
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em> tags
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert `code` to <code> tags
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return html;
}

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
      const formattedResponse = markdownToHtml(data.response);
      chatBox.innerHTML += `<div class="chat bot"><strong>Bot:</strong> ${formattedResponse}</div>`;
    } else {
      chatBox.innerHTML += `<div class="chat bot"><strong>Error:</strong> ${data.error || 'Unknown error'}</div>`;
    }

  } catch (err) {
    chatBox.innerHTML += `<div class="chat bot"><strong>Error:</strong> ${err.message}</div>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
