declare namespace Cordova {
    declare interface HookContext {
        hook: string;
        opts: {
            platforms: string[];
            options: {
                argv: any[];
            };
            verbose: boolean;
            silent: boolean;
            nohooks: any[];
            searchpath?: string;
            save: boolean;
            projectRoot: string;
            cordova: {
                platforms: string[];
                plugins: string[];
                version: string;
            };
        };
        cmdLine: string;
        scriptLocation: string;
    }
}
