const express = require("express")
const WebSocket = require('ws');

const app = 
express()
.set("view engine", "hbs")
.use("/",(req,res)=>{
    const path = req.originalUrl
    if(!path.startsWith("/?")){
        res.end()
        return;
    }
    const ip = req.headers['x-forwarded-for']
    res.render("receiveClient.hbs",{
        rooms:Object.keys(ipThemes[ip]??{}).filter(e=>ipThemes[ip][e].users.some(u=>!u.isDebuger))
    })
}).listen(process.env.PORT||9000,()=>{
    console.log("Started")
})

const wsServer = new WebSocket.Server({server:app });
const ipThemes = {}
wsServer.on('connection', (client,req)=>{
    const ip = req.headers['x-forwarded-for']
    const [isDebug,random,tag] = req.url.substring(1).split("/",3)

    if(!(ip in ipThemes))Object.assign(ipThemes,{[ip]:{}})
    const ipTheme = ipThemes[ip]
    if(!(tag in ipTheme))Object.assign(ipTheme,{[tag]:{users:[],messages:[]}})
    const theme = ipTheme[tag]
    let user = theme.users.find(e=>e.random==random)
    if(user){
        user.ws = client
        while(user.buffer.length!=0)
            [...user.buffer.splice(0,user.buffer.length)].forEach(msg=>client.send(msg))
    }else{
        user = {ws:client,random,buffer:[],isDebuger:!!+isDebug}
        theme.users.push(user)
        client.send('{"command":"clear","args":[]}')
        theme.messages.forEach(msg=>client.send(msg))
    }
    // console.log(ipThemes)
    // console.log(theme.users)
    setInterval(()=>client.send("1"),50000)
    client.on("message",mess=>{
        const msg = mess.toString("utf-8")
        console.log(msg)
        if(msg=='{"command":"clear","args":[]}'){
            theme.messages.splice(0,theme.length)
            theme.users=theme.users.filter(e=>e.ws.readyState==WebSocket.OPEN)
        }
        theme.users.forEach(({ws,buffer,random:rand,isDebuger})=>{
            if(rand==random)return;
            if(!isDebuger)return;
            if(ws.readyState==WebSocket.CLOSED)buffer.push(msg)
            else ws.send(msg)
        })
    })
});


