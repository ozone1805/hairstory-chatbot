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

let threadId = null;

// On page load, request a new thread ID
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/new_thread', { method: 'POST' });
    const data = await res.json();
    threadId = data.thread_id;
  } catch (err) {
    alert('Failed to start a new conversation. Please reload the page.');
  }
});

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  // Display user message
  chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> ${message}</div>`;
  input.value = "";

  // Show rainbow wheel as cursor
  const wheel = document.getElementById("rainbow-wheel");
  wheel.style.display = "block";
  document.body.classList.add("loading");

  // Get current mouse position immediately
  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;
  let rotationAngle = 0;

  // Function to get current mouse position (if available)
  const getCurrentMousePosition = () => {
    // Try to get from a global mouse tracker or use a reasonable default
    if (window.lastMouseX !== undefined && window.lastMouseY !== undefined) {
      return { x: window.lastMouseX, y: window.lastMouseY };
    }
    // Fallback to center of viewport
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  };

  // Initialize position at current mouse location
  const initialPos = getCurrentMousePosition();
  currentX = targetX = initialPos.x;
  currentY = targetY = initialPos.y;

  // Function to update wheel position with smooth interpolation
  const updateWheelPosition = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  };

  // Smooth animation loop
  const animateWheel = () => {
    // Smooth interpolation for position
    currentX += (targetX - currentX) * 0.3;
    currentY += (targetY - currentY) * 0.3;
    
    // Smooth rotation
    rotationAngle += 6; // 6 degrees per frame for smooth rotation
    
    // Apply transforms
    wheel.style.left = currentX + "px";
    wheel.style.top = currentY + "px";
    wheel.style.transform = `translate(-50%, -50%) rotate(${rotationAngle}deg)`;
    
    // Continue animation if wheel is visible
    if (wheel.style.display === "block") {
      requestAnimationFrame(animateWheel);
    }
  };

  // Add mouse move listener
  document.addEventListener("mousemove", updateWheelPosition);
  
  // Start smooth animation
  animateWheel();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId })
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
  } finally {
    // Hide rainbow wheel and remove mouse listener
    wheel.style.display = "none";
    document.body.classList.remove("loading");
    document.removeEventListener("mousemove", updateWheelPosition);
    
    // Reset position for next use
    currentX = 0;
    currentY = 0;
    targetX = 0;
    targetY = 0;
    rotationAngle = 0;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
