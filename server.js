const http = require('http');
const { HttpError } = require('koa');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const Router = require('koa-router');
const WS =require('ws');

const router = new Router();
const app = new Koa();
 

app.use((ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
      return  next();
       
    }
   
    const headers = { 'Access-Control-Allow-Origin': '*', };
  
    if (ctx.request.method !== 'OPTIONS') {
      ctx.response.set({ ...headers });
      try {
        return next();
      } catch (e) {
        e.headers = { ...e.headers, ...headers };
        throw e;
      }
    }
  
    if (ctx.request.get('Access-Control-Request-Method')) {
      ctx.response.set({
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
      });
  
      if (ctx.request.get('Access-Control-Request-Headers')) {
        ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
      }
  
      ctx.response.status = 204;
    }
  });

  
app.use(koaBody({
    urlencoded: true,
}));
  
router.post('/checkUserName', async (ctx) => {
    const{ user, id } = ctx.request.body;
    if (Object.values(chatUsers).includes(user)){
       ctx.response.status = 202
       ctx.response.body = { status: "name taken" };
       return
    }
    chatUsers[count-1]=user;
    ctx.response.status = 200
});



 
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.port ||9000;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({server});
 
let chatUsers = {

};
 
let chat =[];

var count =  1 ; 

 
wsServer.on('connection', (ws)=>{

  const userId = count++;
  console.log('connect user: ' + userId);

  ws.on('message', (e)=>{
    const message = JSON.parse(Buffer.from(e).toString());
    message['date'] = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`;
    chat.push(message);

    Array.from(wsServer.clients)
      .filter(client => client.readyState == WS.OPEN)
      .forEach(client => client.send(JSON.stringify({type: 'lastMessage', payload: message})))

  })
   
  ws.on('close', () =>{
    console.log('disconnect user: ' + userId)
    delete chatUsers[userId-1];
    Array.from(wsServer.clients)
      .filter(client => client.readyState == WS.OPEN) 
      .forEach(client => client.send(JSON.stringify({type: 'users', payload: {chatUsers}})));
  });

  Array.from(wsServer.clients)
    .filter(client => client.readyState == WS.OPEN)
    .forEach(client => client.send(JSON.stringify({type: 'chat', payload: {chat}})));
  Array.from(wsServer.clients)
    .filter(client => client.readyState == WS.OPEN)
    .forEach(client => client.send(JSON.stringify({type: 'users', payload: {chatUsers}})));
});

  
server.listen(port)
