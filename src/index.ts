import router from 'koa-router';
import {fs} from 'mz';
import {join as pathJoin} from 'path';

type SyncFile = {[key:string]:MarandaMiddleware<any, any>}[];
type AsyncFile = Promise<{[key:string]:MarandaMiddleware<any, any>}>[];
interface RouteOps {
    name?: string;
    sensitive?: boolean;
    strict?: boolean;
    end?: boolean,
    prefix?: string,
    ignoreCaptures?:boolean
}
function LoadFolder(path:string, modules:SyncFile|AsyncFile, type:string){
    const files = fs.readdirSync(path);
    for (const f of files) {
        const stat = fs.statSync(pathJoin(path, f));
        if (stat.isFile() && /\.[t|j]s$/.test(f)) {
            if (type === 'sync') {
                (<SyncFile>modules).push(require(pathJoin(path, f)))
            }else if (type === 'async') {
                (<AsyncFile>modules).push(import(pathJoin(path, f)))
            }
        }else if (stat.isDirectory()) {
            LoadFolder(pathJoin(path, f),modules, type);
        }
    }
};
function LoadFiles(RouterPath:string[]|string, type:'sync'|'async'){
    const modules:SyncFile|AsyncFile = [];
    const path = typeof RouterPath == 'string' ? [RouterPath] : RouterPath;
    for (const f of path) {
        const stat = fs.statSync(f);
        if (stat.isFile() && /\.js$/.test(f)) {
            if (type === 'sync') {
                (<SyncFile>modules).push(require(f))
            }else if (type === 'async') {
                (<AsyncFile>modules).push(import(f))
            }
        }else if (stat.isDirectory()) {
            LoadFolder(f, modules, type);
        }
    }
    return modules;
}
function RegisterRouter(M:{[key:string]:MarandaMiddleware<any, any>}){
    Object.keys(M).forEach((key)=>{
        if (M[key].path && M[key].methods && M[key].middleware) {
            // @ts-ignore
            this.register(M[key].path, M[key].methods, M[key].middleware, M[key].opts)
        }
    })
}
export async function LoadRouterFile<R extends router<any,any>>(this: R, RouterPath:string[]|string, sync:boolean = true){
    if (sync) {
        const modules = <SyncFile>LoadFiles(RouterPath, 'sync');
        for (const M of modules) {RegisterRouter.call(this, M);}
    }else{
        const modules = <AsyncFile>LoadFiles(RouterPath, 'async');
        for (const M of modules) {RegisterRouter.call(this, await M);}
    }
}
export type MarandaMiddleware<StateT, CustomT> = {
    path: string | string[] | RegExp | RegExp[],
    methods: string[],
    middleware: router.IMiddleware<StateT, CustomT> | router.IMiddleware<StateT, CustomT>[],
    opts?: RouteOps
};
export class MarandaRouter<StateT, CustomT> extends router<StateT, CustomT>{
    readonly LoadRouterFile: typeof LoadRouterFile;
    constructor(RouterOptions?:{Path?:string[]|string, Opts?:RouteOps}){
        const path = RouterOptions ? RouterOptions.Path : undefined;
        const opts = RouterOptions ? RouterOptions.Opts : undefined;
        super(opts);
        this.LoadRouterFile = LoadRouterFile.bind(this);
        if (path) {this.LoadRouterFile(path)}
    }
}
export {router as koaRouter}