"use strict";
const xmlbuilder2_1 = require("xmlbuilder2");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const glob = require('tiny-glob');
(0, dotenv_1.config)();
async function remove_splashscreen_theme(root) {
    const theme_xml = (0, path_1.join)(root, 'platforms/android/app/src/main/res/values/themes.xml');
    const theme_content = await (0, promises_1.readFile)(theme_xml, 'utf8');
    const theme = (0, xmlbuilder2_1.convert)(theme_content, { format: 'object' });
    theme.resources.style = theme.resources.style.filter((style) => style['@name'] !== 'Theme.App.SplashScreen');
    const new_theme_content = (0, xmlbuilder2_1.create)(theme).end({ prettyPrint: true });
    await (0, promises_1.writeFile)(theme_xml, new_theme_content);
    await (0, promises_1.unlink)((0, path_1.join)(root, 'platforms/android/app/src/main/res/drawable/ic_cdv_splashscreen.xml'));
    console.log('Removed Theme.App.SplashScreen');
}
async function remove_cordova_icon(root) {
    const files = await glob('platforms/android/app/src/main/res/mipmap*/ic_launcher*', { cwd: root });
    await Promise.all(files.map((file) => (0, promises_1.unlink)((0, path_1.join)(root, file))));
    console.log('Removed cordova icon');
}
async function update_config(root) {
    const app_url = process.env.APP_URL ?? 'https://remote-vts.1ppl.me';
    const config_xml = (0, path_1.join)(root, 'platforms/android/app/src/main/res/xml/config.xml');
    const config_content = await (0, promises_1.readFile)(config_xml, 'utf8');
    const config = (0, xmlbuilder2_1.create)(config_content);
    const widget = config.first();
    const whitelist = widget.find((node) => {
        if (node.node.nodeName !== 'allow-navigation') {
            return false;
        }
        const obj = node.toObject();
        return obj['allow-navigation']['@href'].match(/^https?:\/\//);
    });
    if (whitelist) {
        whitelist.att('href', `${app_url}/*`);
    }
    else {
        widget.ele('allow-navigation', { href: `${app_url}/*` });
    }
    const access = widget.find((node) => node.node.nodeName === 'access');
    if (access) {
        access.att('origin', app_url);
    }
    else {
        widget.ele('access', { origin: app_url });
    }
    const content = widget.find((node) => node.node.nodeName === 'content');
    if (content) {
        content.att('src', app_url);
    }
    else {
        widget.ele('content', { src: app_url });
    }
    const new_config_content = config.end({ prettyPrint: true });
    await (0, promises_1.writeFile)(config_xml, new_config_content);
    console.log('Updated config.xml');
}
async function set_gradle_properties(root) {
    const gradle_properties = (0, path_1.join)(root, 'platforms/android/gradle.properties');
    let gradle_properties_content = await (0, promises_1.readFile)(gradle_properties, 'utf8');
    const pattern = /^cdvMinSdkVersion=.+$/m;
    if (!pattern.test(gradle_properties_content)) {
        gradle_properties_content += '\ncdvMinSdkVersion=31\n';
    }
    else {
        gradle_properties_content = gradle_properties_content.replace(pattern, 'cdvMinSdkVersion=31');
    }
    await (0, promises_1.writeFile)(gradle_properties, gradle_properties_content);
    console.log('Updated gradle.properties');
}
async function patch_browsertab(root) {
    const java_file = (0, path_1.join)(root, 'platforms/android/app/src/main/java/com/google/cordova/plugin/BrowserTab.java');
    const content = await (0, promises_1.readFile)(java_file, 'utf8');
    await (0, promises_1.writeFile)(java_file, content.replace('import android.support.customtabs.CustomTabsIntent;', 'import androidx.browser.customtabs.CustomTabsIntent;'));
    console.log('Patched BrowserTab.java');
}
module.exports = async function ({ opts }) {
    const d = path_1.join.bind(null, opts.projectRoot);
    try {
        await remove_splashscreen_theme(opts.projectRoot);
        await remove_cordova_icon(opts.projectRoot);
        await update_config(opts.projectRoot);
        await set_gradle_properties(opts.projectRoot);
        await patch_browsertab(opts.projectRoot);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
//# sourceMappingURL=after_prepare.js.map