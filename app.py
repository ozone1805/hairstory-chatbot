from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai
import time

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")

# Debug logging to verify assistant ID
print(f"Using Assistant ID: {assistant_id}")
print(f"OpenAI API Key configured: {'Yes' if openai.api_key else 'No'}")

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests for local dev

# In-memory thread cache for simplicity (restart = new session)
# Remove global thread_id

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/new_thread", methods=["POST"])
def new_thread():
    thread = openai.beta.threads.create()
    return jsonify({"thread_id": thread.id})

@app.route("/chat", methods=["POST"])
def chat():
    if not request.json:
        return jsonify({"error": "Invalid JSON"}), 400
    user_input = request.json.get("message")
    thread_id = request.json.get("thread_id")
    if not user_input:
        return jsonify({"error": "Missing message"}), 400
    if not assistant_id:
        return jsonify({"error": "Assistant ID not configured"}), 500
    if not thread_id:
        return jsonify({"error": "Missing thread_id"}), 400
    # Step 2: Add user's message to the thread
    openai.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_input
    )
    # Step 3: Run the assistant
    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    # Step 4: Poll until the run completes
    while True:
        run_status = openai.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
        if run_status.status == "completed":
            break
        elif run_status.status in ["failed", "cancelled", "expired"]:
            return jsonify({"error": f"Run failed: {run_status.status}"}), 500
        time.sleep(0.5)
    # Step 5: Retrieve the latest message
    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    assistant_reply = next(
        (msg.content[0].text.value for msg in messages.data if msg.role == "assistant" and hasattr(msg.content[0], 'text') and msg.content[0].type == 'text'),
        "No response from assistant."
    )
    return jsonify({"response": assistant_reply})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
