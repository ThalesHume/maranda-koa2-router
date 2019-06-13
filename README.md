# useage

##### npm i --save maranda-koa2-router

### for the complete maranda koa server case, with static, session-mysql, koabody, router

### please visit https://github.com/yu87109/maranda-koa-server-example

### this example is used for ts, if you are js user, if can use as almost the same, just delete the type define.
``` typescript
//app.ts
import Router,{ koaRouter } from 'maranda-koa2-router';
import Koa from 'koa';
import { join as pathJoin } from 'path'

interface Ctx {
    // your custom context
}
export type Route = Router.Route;
export type Middleware = KoaRouter.IMiddleware<any, Ctx>;

const app = new Koa<any,Ctx>();
const router = new Router<any, Ctx>(pathJoin(__dirname,'Routers'),{..});
router.get('/', async(ctx, next)=>{
    ...
    await next();
    ...
});
app.use(router.routes())

app.listen(8080)
console.log('app started at port 8080...');

//Routers/ajax/text.ts
import { Route } from '../../app';
import { middleware1 } from '../Middlewares/a'
import { middleware2 } from '../Middlewares/b'
import { middleware3 } from '../Middlewares/c'

const a0:Route = {
    path: '/a0',
    methods: ['get'],
    middleware: middleware1
}
const b1:Route ={
    path: ['/b1','/b1/x'],
    methods: ['get'],
    middleware: [middleware2,middleware3]
}
export {a0, b1}

//Middlewares/a.ts
import { Middleware } from '../../app'
export middleware1:Middleware = aysnc (ctx, next) => {
    ...
    await next();
    ...
}

```

```typescript
// type2
//app.ts
const router = Router.LoadRoutes<any, Ctx>(pathJoin(__dirname,'Routers'),{..});
....
router.then((rt)=>{
    rt.get('/', async(ctx, next)=>{
        ...
        await next();
        ...
    });
    app.use(rt.routes())
    app.listen(8080)
    console.log('app started at port 8080...');
})
```


---

[for more Versions, click see the changelog](./CHANGELOG.md)
