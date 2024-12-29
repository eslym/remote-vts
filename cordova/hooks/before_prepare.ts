import { convert, create } from 'xmlbuilder2';
import { config as dotenv } from 'dotenv';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

dotenv();

export = async function ({ opts }: Cordova.HookContext) {
    try {
        await add_splashscreen_theme(opts.projectRoot);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

async function add_splashscreen_theme(root: string) {
    const theme_xml = join(root, 'platforms/android/app/src/main/res/values/themes.xml');
    if (!existsSync(theme_xml)) {
        console.log('No themes.xml found, skipping');
        return;
    }
    const theme_content = await readFile(theme_xml, 'utf8');
    const theme = convert(theme_content, { format: 'object' }) as any;
    const splashscreen = Array.isArray(theme.resources.style)
        ? theme.resources.style.find((style: any) => style['@name'] == 'Theme.App.SplashScreen')
        : null;
    if (!splashscreen) {
        if (!Array.isArray(theme.resources.style)) {
            theme.resources.style = [theme.resources.style];
        }
        theme.resources.style.unshift({
            '@name': 'Theme.App.SplashScreen',
            '@parent': 'Theme.SplashScreen.IconBackground',
            item: [
                {
                    '@name': 'windowSplashScreenBackground',
                    '#': '@color/cdv_splashscreen_background'
                },
                {
                    '@name': 'windowSplashScreenAnimatedIcon',
                    '#': '@drawable/ic_cdv_splashscreen'
                },
                {
                    '@name': 'windowSplashScreenAnimationDuration',
                    '#': '200'
                },
                {
                    '@name': 'postSplashScreenTheme',
                    '#': '@style/Theme.AppCompat.NoActionBar'
                }
            ]
        });
        console.log('Added Theme.App.SplashScreen for cordova prepare');
    }
    const new_theme_content = create(theme).end({ prettyPrint: true });
    await writeFile(theme_xml, new_theme_content);
}
