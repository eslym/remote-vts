import { convert, create } from 'xmlbuilder2';
import { config as dotenv } from 'dotenv';
import { join } from 'path';
import { readFile, writeFile, unlink } from 'fs/promises';
const glob = require('tiny-glob') as typeof import('tiny-glob');

dotenv();

export = async function ({ opts }: Cordova.HookContext) {
    try {
        await remove_splashscreen_theme(opts.projectRoot);
        await remove_cordova_icon(opts.projectRoot);
        await update_config(opts.projectRoot);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

async function remove_splashscreen_theme(root: string) {
    const theme_xml = join(root, 'platforms/android/app/src/main/res/values/themes.xml');
    const theme_content = await readFile(theme_xml, 'utf8');
    const theme = convert(theme_content, { format: 'object' }) as any;
    theme.resources.style = theme.resources.style.filter(
        (style: any) => style['@name'] !== 'Theme.App.SplashScreen'
    );
    const new_theme_content = create(theme).end({ prettyPrint: true });
    await writeFile(theme_xml, new_theme_content);
    await unlink(join(root, 'platforms/android/app/src/main/res/drawable/ic_cdv_splashscreen.xml'));
    console.log('Removed Theme.App.SplashScreen');
}

async function remove_cordova_icon(root: string) {
    const files = await glob(join(root, 'platforms/android/app/src/main/res/mipmap*/ic_launcher*'));
    await Promise.all(files.map((file) => unlink(file)));
    console.log('Removed cordova icon');
}

async function update_config(root: string) {
    const config_xml = join(root, 'platforms/android/app/src/main/res/xml/config.xml');
    const config_content = await readFile(config_xml, 'utf8');
    const config = convert(config_content, { format: 'object' }) as any;
    config.widget['allow-navigation']['@href'] = `${process.env.APP_URL}/*`;
    config.widget['access']['@origin'] = process.env.APP_URL;
    config.widget['content']['@src'] = process.env.APP_URL;
    const new_config_content = create(config).end({ prettyPrint: true });
    await writeFile(config_xml, new_config_content);
    console.log('Updated config.xml');
}
