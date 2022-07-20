console.clear()
const sleep = (ms)=>new Promise(res=>setTimeout(res, ms))
const i = async ()=>{
    for(let i = 0;i<200;i++){
        await sleep(100)
        console.log(123)
    }
}
i()