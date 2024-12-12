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
    const files = await glob((0, path_1.join)(root, 'platforms/android/app/src/main/res/mipmap*/ic_launcher*'));
    await Promise.all(files.map((file) => (0, promises_1.unlink)(file)));
    console.log('Removed cordova icon');
}
async function update_config(root) {
    const config_xml = (0, path_1.join)(root, 'platforms/android/app/src/main/res/xml/config.xml');
    const config_content = await (0, promises_1.readFile)(config_xml, 'utf8');
    const config = (0, xmlbuilder2_1.convert)(config_content, { format: 'object' });
    config.widget['allow-navigation']['@href'] = `${process.env.APP_URL}/*`;
    config.widget['access']['@origin'] = process.env.APP_URL;
    config.widget['content']['@src'] = process.env.APP_URL;
    const new_config_content = (0, xmlbuilder2_1.create)(config).end({ prettyPrint: true });
    await (0, promises_1.writeFile)(config_xml, new_config_content);
    console.log('Updated config.xml');
}
module.exports = async function ({ opts }) {
    try {
        await remove_splashscreen_theme(opts.projectRoot);
        await remove_cordova_icon(opts.projectRoot);
        await update_config(opts.projectRoot);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
