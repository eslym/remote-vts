import { convert, create } from 'xmlbuilder2';
import { config as dotenv } from 'dotenv';
import { join } from 'path';
import { readFile, writeFile, unlink, copyFile, mkdir } from 'fs/promises';
import { existsSync, constants as fsConst } from 'fs';
const glob = require('tiny-glob') as typeof import('tiny-glob');

dotenv();

export = async function ({ opts }: Cordova.HookContext) {
    const d = join.bind(null, opts.projectRoot);
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
    const files = await glob('platforms/android/app/src/main/res/mipmap*/ic_launcher*', { cwd: root });
    await Promise.all(files.map((file) => unlink(join(root, file))));
    console.log('Removed cordova icon');
}

async function update_config(root: string) {
    const app_url = process.env.APP_URL ?? 'https://remote-vts.1ppl.me';
    const config_xml = join(root, 'platforms/android/app/src/main/res/xml/config.xml');
    const config_content = await readFile(config_xml, 'utf8');
    const config = create(config_content);
    const widget = config.first();
    const whitelist = widget.find((node) => {
        if(node.node.nodeName !== 'allow-navigation') {
            return false;
        }
        const obj = node.toObject() as any;
        return obj['allow-navigation']['@href'].match(/^https?:\/\//);
    });
    if(whitelist) {
        whitelist.att('href', `${app_url}/*`);
    } else {
        widget.ele('allow-navigation', { href: `${app_url}/*` });
    }
    const access = widget.find((node) => node.node.nodeName === 'access');
    if(access) {
        access.att('origin', app_url);
    } else {
        widget.ele('access', { origin: app_url });
    }
    const content = widget.find((node) => node.node.nodeName === 'content');
    if(content) {
        content.att('src', app_url);
    } else {
        widget.ele('content', { src: app_url });
    }
    const new_config_content = config.end({ prettyPrint: true });
    await writeFile(config_xml, new_config_content);
    console.log('Updated config.xml');
}
