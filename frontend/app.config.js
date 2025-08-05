export default {
  expo: {
    name: "KMIT Events",
    slug: "kmit-events",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kmit.events"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      package: "com.kmit.events"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3000/api"
    }
  }
};