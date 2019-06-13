import KoaRouter from 'koa-router';
import { fs as Fs } from 'mz';
import { join as pathJoin, extname as extName } from 'path';

type SyncFile = { [key: string]: Router.Route<any, any> };
type AsyncFile = Promise<{ [key: string]: Router.Route<any, any> }>;
function LoadFiles(filePaths: string[] | string, fileExt: string, type: 'sync' | 'async') {
    const modules: SyncFile[] | AsyncFile[] = [];
    const path = typeof filePaths == 'string' ? [filePaths] : filePaths;
    for (const f of path) {
        const stat = Fs.statSync(f);
        if (stat.isFile() && extName(f) == `.${fileExt}`) {
            if (type === 'sync') {
                (<SyncFile[]>modules).push(require(f))
            } else if (type === 'async') {
                (<AsyncFile[]>modules).push(import(f))
            }
        } else if (stat.isDirectory()) {
            LoadFolder(f, modules, fileExt, type);
        }
    }
    return modules;
}
function LoadFolder(folderPath: string, modules: SyncFile[] | AsyncFile[], fileExt: string, type: string) {
    const files = Fs.readdirSync(folderPath);
    for (const f of files) {
        const stat = Fs.statSync(pathJoin(folderPath, f));
        if (stat.isFile() && extName(f) == `.${fileExt}`) {
            if (type === 'sync') {
                (<SyncFile[]>modules).push(require(pathJoin(folderPath, f)))
            } else if (type === 'async') {
                (<AsyncFile[]>modules).push(import(pathJoin(folderPath, f)))
            }
        } else if (stat.isDirectory()) {
            LoadFolder(pathJoin(folderPath, f), modules, fileExt, type);
        }
    }
};
function RegisterRoutes<R extends KoaRouter<any, any>>(this: R, routes: SyncFile) {
    Object.keys(routes).forEach((key) => {
        if (routes[key].path && routes[key].methods && routes[key].middleware) {
            //@ts-ignore
            this.register(routes[key].path, routes[key].methods, routes[key].middleware, routes[key].opts)
        }
    })
}
class Router<StateT, CustomT> extends KoaRouter<StateT, CustomT>{
    constructor(filePaths: string[] | string);
    constructor(filePaths: string[] | string, fileExt: string);
    constructor(filePaths: string[] | string, fileExt: string, RouterOpts: Router.Options);
    constructor(filePaths: string[] | string, fileExt?: string, RouterOpts?: Router.Options) {
        super(RouterOpts);
        fileExt = fileExt || 'js';
        const modules = <SyncFile[]>LoadFiles(filePaths, fileExt, 'sync');
        for (const module of modules) { RegisterRoutes.call(this, module); }
    }
}
namespace Router {
    export interface Route<StateT, CustomT> {
        path: string | string[] | RegExp | RegExp[],
        methods: string[],
        middleware: Middleware<StateT, CustomT> | Middleware<StateT, CustomT>[],
        opts?: Router.Options
    };
    export type Middleware<StateT, CustomT> = KoaRouter.IMiddleware<StateT, CustomT>;
    export interface Options {
        name?: string;
        sensitive?: boolean;
        strict?: boolean;
        end?: boolean,
        prefix?: string,
        ignoreCaptures?: boolean
    }
    export async function LoadRoutes<StateT, CustomT>(filePaths: string[] | string): Promise<KoaRouter<StateT, CustomT>>;
    export async function LoadRoutes<StateT, CustomT>(filePaths: string[] | string, fileExt: string): Promise<KoaRouter<StateT, CustomT>>;
    export async function LoadRoutes<StateT, CustomT>(filePaths: string[] | string, fileExt: string, RouterOpts: Router.Options): Promise<KoaRouter<StateT, CustomT>>;
    export async function LoadRoutes<StateT, CustomT>(filePaths: string[] | string, fileExt?: string, RouterOpts?: Router.Options) {
        fileExt = fileExt || 'js';
        const modules = <AsyncFile[]>LoadFiles(filePaths, fileExt, 'async');
        const router = new KoaRouter<StateT, CustomT>(RouterOpts);
        for (const module of modules) { RegisterRoutes.call(router, await module); }
        return router;
    }
}
export default Router;
export { KoaRouter }