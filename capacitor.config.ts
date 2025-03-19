import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'HabitFlow',
  webDir: 'build',
  cordova: {
    preferences: {
      Orientation: 'portrait'
    }
  }
};

export default config;