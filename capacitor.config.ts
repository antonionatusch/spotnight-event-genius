import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.spotnight.app",
  appName: "SpotNight",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
};

export default config;
