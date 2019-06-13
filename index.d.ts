import KoaRouter from 'koa-router';
declare class Router<StateT, CustomT> extends KoaRouter<StateT, CustomT> {
    constructor(filePaths: string[] | string);
    constructor(filePaths: string[] | string, fileExt: string);
    constructor(filePaths: string[] | string, fileExt: string, RouterOpts: Router.Options);
}
declare namespace Router {
    interface Route<StateT, CustomT> {
        path: string | string[] | RegExp | RegExp[];
        methods: string[];
        middleware: Middleware<StateT, CustomT> | Middleware<StateT, CustomT>[];
        opts?: Router.Options;
    }
    type Middleware<StateT, CustomT> = KoaRouter.IMiddleware<StateT, CustomT>;
    interface Options {
        name?: string;
        sensitive?: boolean;
        strict?: boolean;
        end?: boolean;
        prefix?: string;
        ignoreCaptures?: boolean;
    }
    function LoadRoutes<StateT, CustomT>(filePaths: string[] | string): Promise<KoaRouter<StateT, CustomT>>;
    function LoadRoutes<StateT, CustomT>(filePaths: string[] | string, fileExt: string): Promise<KoaRouter<StateT, CustomT>>;
    function LoadRoutes<StateT, CustomT>(filePaths: string[] | string, fileExt: string, RouterOpts: Router.Options): Promise<KoaRouter<StateT, CustomT>>;
}
export default Router;
export { KoaRouter };
