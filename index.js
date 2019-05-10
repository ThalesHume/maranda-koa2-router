"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
exports.koaRouter = koa_router_1.default;
const mz_1 = require("mz");
const path_1 = require("path");
function LoadFolder(path, modules, type) {
    const files = mz_1.fs.readdirSync(path);
    for (const f of files) {
        const stat = mz_1.fs.statSync(path_1.join(path, f));
        if (stat.isFile() && /\.[t|j]s$/.test(f)) {
            if (type === 'sync') {
                modules.push(require(path_1.join(path, f)));
            }
            else if (type === 'async') {
                modules.push(Promise.resolve().then(() => __importStar(require(path_1.join(path, f)))));
            }
        }
        else if (stat.isDirectory()) {
            LoadFolder(path_1.join(path, f), modules, type);
        }
    }
}
;
function LoadFiles(RouterPath, type) {
    const modules = [];
    const path = typeof RouterPath == 'string' ? [RouterPath] : RouterPath;
    for (const f of path) {
        const stat = mz_1.fs.statSync(f);
        if (stat.isFile() && /\.js$/.test(f)) {
            if (type === 'sync') {
                modules.push(require(f));
            }
            else if (type === 'async') {
                modules.push(Promise.resolve().then(() => __importStar(require(f))));
            }
        }
        else if (stat.isDirectory()) {
            LoadFolder(f, modules, type);
        }
    }
    return modules;
}
function RegisterRouter(M) {
    Object.keys(M).forEach((key) => {
        if (M[key].path && M[key].methods && M[key].middleware) {
            // @ts-ignore
            this.register(M[key].path, M[key].methods, M[key].middleware, M[key].opts);
        }
    });
}
function LoadRouterFile(RouterPath, sync = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (sync) {
            const modules = LoadFiles(RouterPath, 'sync');
            for (const M of modules) {
                RegisterRouter.call(this, M);
            }
        }
        else {
            const modules = LoadFiles(RouterPath, 'async');
            for (const M of modules) {
                RegisterRouter.call(this, yield M);
            }
        }
    });
}
exports.LoadRouterFile = LoadRouterFile;
class MarandaRouter extends koa_router_1.default {
    constructor(RouterOptions) {
        const path = RouterOptions ? RouterOptions.Path : undefined;
        const opts = RouterOptions ? RouterOptions.Opts : undefined;
        super(opts);
        this.LoadRouterFile = LoadRouterFile.bind(this);
        if (path) {
            this.LoadRouterFile(path);
        }
    }
}
exports.MarandaRouter = MarandaRouter;
