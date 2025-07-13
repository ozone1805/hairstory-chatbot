# Hairstory Chatbot

A simple AI chatbot for hair care advice built with Flask and OpenAI.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ASSISTANT_ID=your_assistant_id_here
   ```

3. Run the app:
   ```bash
   python app.py
   ```

4. Open http://localhost:5000 in your browser

## Files

- `app.py` - Flask backend
- `templates/index.html` - Chat interface
- `static/main.js` - Frontend logic
- `requirements.txt` - Python packages 