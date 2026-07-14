# Location Tracker Web App

A simple React web app that uses the browser's geolocation API to track the user's current location in real time.

## What this app does

- Starts live location tracking when the page loads
- Displays latitude, longitude, accuracy, and the last update time
- Keeps a short history of recent location points
- Estimates the distance traveled between the first and latest samples
- Lets users stop, clear, or restart tracking at any time

## Features

- Real-time geolocation updates
- Clean, responsive dashboard
- Easy-to-use buttons for start, stop, and clear
- Works in modern browsers that support geolocation

## How it works

The app requests location permission from the browser and uses the browser's built-in geolocation services to update the current position. It stores a rolling list of recent points and displays useful location details.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the local URL shown in the terminal, usually:
   ```text
   http://localhost:5173/
   ```

## Build for production

```bash
npm run build
```

## Notes

- Location tracking only works if the browser has permission to access the device location.
- Accuracy may vary depending on the device, browser, and network connection.
- Some browsers may require HTTPS for full geolocation support in certain contexts.
