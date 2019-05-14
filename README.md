#useage

npm i --save maranda-koa2-router

// for the complete maranda koa server case, with static, session-mysql, koabody, router

// please visit https://github.com/yu87109/maranda-koa-server-example

//this example is used for ts, if you are js user, if can use as almost the same, just delete the type define.
``` typescript
// type1
//app.ts
import {MarandaRouter, koaRouter, LoadRouterFile, MarandaMiddleware as Middleware} from 'maranda-koa2-router';
import Koa from 'koa';
import {join} from 'path'

export type MarandaMiddleware = Middleware<{a:string},{b:number}>

const Path =join(__dirname,'Routers');
//for array path , the router file must end with '.js'
/* const path = [
    join(__dirname,'YourRouteDIR1'),
    join(__dirname,'YourRouteDIR2'),
    join(__dirname,'ajax.js')
] */
const Opts = {
    end: true
}
//for more opts
/*  end?: boolean,
    prefix?: string,
    ignoreCaptures?:boolean
    name?: string;
    sensitive?: boolean;
    strict?: boolean;
 */
const app = new Koa<{a:string},{b:number}>();
const Router = new MarandaRouter<{a:string},{b:number}>({Path, Opts});
//for other init types
// type2
const Router = new MarandaRouter<{a:string},{b:number}>({Opts});
Router.LoadRouterFile(Path, true); 
// type3
const Router = new MarandaRouter<{a:string},{b:number}>({Opts});
LoadRouterFile.call(Router, Path); 
// type4  only can use the koa-router opts
const Router = new koaRouter({sensitive:true});
LoadRouterFile.call(Router, Path) 


Router.get('/', async(ctx, next)=>{
    ctx.state.a = 'X'
    ctx.body = 'inde';
    await next();
});
app.use(Router.routes())
app.use(async (ctx)=>{
	ctx.body += ctx.state.a;
})

app.listen(8080)
console.log('app started at port 8080...');

#Routers/ajax/text.js
//Routers/ajax/text.ts
import {MarandaMiddleware} from '../../app';

const a0:MarandaMiddleware = {
    path: '/a0',
    methods: ['get'],
    middleware: [
        async(ctx, next) =>{
            ctx.b = 0;
			ctx.state.a ='X'
            await next()
        },
        async(ctx, next) =>{
            ctx.body = `a${ctx.b}`
            await next()
        },
    ]
}
const b1:MarandaMiddleware ={
    path: ['/b1','/b1/x'],
    methods: ['get'],
    middleware: async(ctx, next) =>{
		ctx.body = 'b1'
        await next()
    }
}
export {a0, b1}

// localhost/     -> indeX
// localhost/a0   -> a0X
// localhost/b1   -> b1undefined
// localhost/b1/x -> b1undefined
```

```typescript
// type2
//app.ts
const Router = new MarandaRouter<{a:string},{b:number}>({Opts});
//or: const Router = new koaRouter({sensitive:true});
const router = <Promise<void>>Router.LoadRouterFile(Path, false);
router.then(()=>{
    Router.get('/', async(ctx, next)=>{
        ctx.state.a = 'X'
        ctx.body = 'inde';
        await next();
    });
    app.use(Router.routes())
    app.use(async (ctx)=>{
        ctx.body += ctx.state.a;
    })
	
    app.listen(8080)
    console.log('app started at port 8080...');
})
```


---

[for more Versions, click see the changelog](./CHANGELOG.md)
