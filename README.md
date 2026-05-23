<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1eT6nScrIy0T1YB8I7jP4RpdwIEOqLiAG

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GROQ_API_KEY` in your Netlify environment variables or a local `.env` file (for use with `netlify dev`).
3. Run the app:
   `npm run dev`

## Deployment

This app is configured for Netlify. 
- The `netlify.toml` handles the build settings and function directory.
- Make sure to set `GROQ_API_KEY` in your Netlify dashboard.
