import type { CapacitorConfig } from '@capacitor/cli';
import * as dotenv from 'dotenv';

dotenv.config();

const config: CapacitorConfig = {
    appId: 'com.eslym.remotevts',
    appName: 'Remote VTS',
    webDir: 'build',
    plugins: {
        SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: true,
            backgroundColor: '#ffffffff'
        },
        LiveUpdate: {
            publicKey: process.env.LIVE_UPDATE_PUBLIC_KEY
        }
    }
};

export default config;
