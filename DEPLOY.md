# Deployment & Build Guide

To run your app on any device without your computer's server, you need two things:
1. **Deploy the Server** (Backend)
2. **Build the App** (Frontend/APK)

---

## Part 1: Deploy the Server to Vercel

Since your app depends on the backend for AI (Gemini), you must host the server code online.

1. **Push to GitHub**:
   - Make sure your project is pushed to a GitHub repository.

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login.
   - Click **Add New** -> **Project**.
   - Import your **Resume-Reviewer** repository.
   - **Environment Variables**: Add the following:
     - `GEMINI_API_KEY`: Your Gemini API Key
   - Click **Deploy**.

3. **Get the URL**:
   - Once successfully deployed, copy the **Production Deployment** domain (e.g., `https://resume-reviewer.vercel.app`).

---

## Part 2: Configure the App

Now tell your app to use the *online* server instead of localhost.

1. Open `eas.json` locally.
2. In the `preview` -> `env` section, replace the placeholder with your Vercel URL:
   ```json
   "env": {
     "EXPO_PUBLIC_API_URL": "https://your-project.vercel.app"
   }
   ```
   *(Make sure there is NO trailing slash `/` at the end)*

**Pro Tip:** This allows you to keep `EXPO_PUBLIC_API_URL` pointing to `localhost` in your local `.env` file (for development), while the APK build automatically uses the Vercel URL!

---

## Part 3: Build the APK

Now you can build the Android APK file.

1. **Install EAS CLI** (if not installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build the APK**:
   ```bash
   eas build -p android --profile preview
   ```

4. **Wait**: Expo will build your app in the cloud. When finished, it will give you a link to download the `.apk` file.

5. **Install**: Send that `.apk` file to your phone and install it!

---

## Important Notes
- **Do not** hardcode the URL in `client/lib/query-client.ts`. Revert any hardcoding you did for testing.
- Ensure your `app.json` has a unique `android.package` name (e.g., `com.yourname.resumechecker`).
