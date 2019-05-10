import router from 'koa-router';

interface RouteOps {
    name?: string;
    sensitive?: boolean;
    strict?: boolean;
    end?: boolean,
    prefix?: string,
    ignoreCaptures?:boolean
}
export function LoadRouterFile<R extends router<any,any>>(this: R, RouterPath:string[]|string, sync?:boolean):Promise<void>|void;
export type MarandaMiddleware<StateT, CustomT> = {
    path: string | string[] | RegExp | RegExp[],
    methods: string[],
    middleware: router.IMiddleware<StateT, CustomT> | router.IMiddleware<StateT, CustomT>[],
    opts?: router.ILayerOptions & {
        end?: boolean,
        prefix?: string,
        ignoreCaptures?:boolean
    }
};
export class MarandaRouter<StateT, CustomT> extends router<StateT, CustomT>{
    readonly LoadRouterFile: typeof LoadRouterFile;
    constructor(RouterOptions?:{Path?:string[]|string, Opts?:RouteOps});
}
export {router as koaRouter}