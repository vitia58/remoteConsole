const NAME = "nodejs"

const WebSocket = require('ws');
const buffer = []
const sendToBuffer = (s)=>{
    firstConsole.log("buf",s)
    buffer.push(s)
}
let send = sendToBuffer
const firstConsole = console
console = new Proxy(firstConsole,{
    get(consol,command){
        if(typeof consol[command]=="function")
            return new Proxy(consol[command],{
                apply(target, thisArg, args){
                    const data = {command,args}
                    send(JSON.stringify(data))
                    // return target.apply(thisArg,args)
                }
            })
        return consol[command]
    }
})
const random = Math.random()
const onCreate = ()=>{
    let webSocket = new WebSocket(`ws://93.79.41.156:9001/0/${random}/${NAME}`)
    const sendToWS = (s)=>{
        webSocket.send(s)
        firstConsole.log("ws",s)
    }
    webSocket.onopen = ()=>{
        firstConsole.log(buffer)
        while(buffer.length!=0)
            buffer.splice(0,buffer.length).forEach(sendToWS)
        send = sendToWS
    }
    webSocket.onclose = ()=>{
        firstConsole.log("close")
        send = sendToBuffer
        setTimeout(onCreate, 1000);
    }
}
onCreate()