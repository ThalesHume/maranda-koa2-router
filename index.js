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
exports.KoaRouter = koa_router_1.default;
const mz_1 = require("mz");
const path_1 = require("path");
function LoadFiles(filePaths, fileExt, type) {
    const modules = [];
    const path = typeof filePaths == 'string' ? [filePaths] : filePaths;
    for (const f of path) {
        const stat = mz_1.fs.statSync(f);
        if (stat.isFile() && path_1.extname(f) == `.${fileExt}`) {
            if (type === 'sync') {
                modules.push(require(f));
            }
            else if (type === 'async') {
                modules.push(Promise.resolve().then(() => __importStar(require(f))));
            }
        }
        else if (stat.isDirectory()) {
            LoadFolder(f, modules, fileExt, type);
        }
    }
    return modules;
}
function LoadFolder(folderPath, modules, fileExt, type) {
    const files = mz_1.fs.readdirSync(folderPath);
    for (const f of files) {
        const stat = mz_1.fs.statSync(path_1.join(folderPath, f));
        if (stat.isFile() && path_1.extname(f) == `.${fileExt}`) {
            if (type === 'sync') {
                modules.push(require(path_1.join(folderPath, f)));
            }
            else if (type === 'async') {
                modules.push(Promise.resolve().then(() => __importStar(require(path_1.join(folderPath, f)))));
            }
        }
        else if (stat.isDirectory()) {
            LoadFolder(path_1.join(folderPath, f), modules, fileExt, type);
        }
    }
}
;
function RegisterRoutes(routes) {
    Object.keys(routes).forEach((key) => {
        if (routes[key].path && routes[key].methods && routes[key].middleware) {
            //@ts-ignore
            this.register(routes[key].path, routes[key].methods, routes[key].middleware, routes[key].opts);
        }
    });
}
class Router extends koa_router_1.default {
    constructor(filePaths, fileExt, RouterOpts) {
        super(RouterOpts);
        fileExt = fileExt || 'js';
        const modules = LoadFiles(filePaths, fileExt, 'sync');
        for (const module of modules) {
            RegisterRoutes.call(this, module);
        }
    }
}
(function (Router) {
    ;
    function LoadRoutes(filePaths, fileExt, RouterOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            fileExt = fileExt || 'js';
            const modules = LoadFiles(filePaths, fileExt, 'async');
            const router = new koa_router_1.default(RouterOpts);
            for (const module of modules) {
                RegisterRoutes.call(router, yield module);
            }
            return router;
        });
    }
    Router.LoadRoutes = LoadRoutes;
})(Router || (Router = {}));
exports.default = Router;
