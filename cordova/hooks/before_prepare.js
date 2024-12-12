"use strict";
const xmlbuilder2_1 = require("xmlbuilder2");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const glob = require('tiny-glob');
(0, dotenv_1.config)();
async function add_splashscreen_theme(root) {
    const themeXml = (0, path_1.join)(root, 'platforms/android/app/src/main/res/values/themes.xml');
    const themeContent = await (0, promises_1.readFile)(themeXml, 'utf8');
    const theme = (0, xmlbuilder2_1.convert)(themeContent, { format: 'object' });
    const splashscreen = Array.isArray(theme.resources.style)
        ? theme.resources.style.find((style) => style['@name'] == 'Theme.App.SplashScreen')
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
    const newThemeContent = (0, xmlbuilder2_1.create)(theme).end({ prettyPrint: true });
    await (0, promises_1.writeFile)(themeXml, newThemeContent);
}
module.exports = async function ({ opts }) {
    try {
        await add_splashscreen_theme(opts.projectRoot);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
