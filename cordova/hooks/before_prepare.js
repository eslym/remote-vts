'use strict';
const xmlbuilder2_1 = require('xmlbuilder2');
const dotenv_1 = require('dotenv');
const path_1 = require('path');
const promises_1 = require('fs/promises');
const fs_1 = require('fs');
(0, dotenv_1.config)();
async function add_splashscreen_theme(root) {
    const theme_xml = (0, path_1.join)(
        root,
        'platforms/android/app/src/main/res/values/themes.xml'
    );
    if (!(0, fs_1.existsSync)(theme_xml)) {
        console.log('No themes.xml found, skipping');
        return;
    }
    const theme_content = await (0, promises_1.readFile)(theme_xml, 'utf8');
    const theme = (0, xmlbuilder2_1.convert)(theme_content, { format: 'object' });
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
    const new_theme_content = (0, xmlbuilder2_1.create)(theme).end({ prettyPrint: true });
    await (0, promises_1.writeFile)(theme_xml, new_theme_content);
}
module.exports = async function ({ opts }) {
    try {
        await add_splashscreen_theme(opts.projectRoot);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
//# sourceMappingURL=before_prepare.js.map
