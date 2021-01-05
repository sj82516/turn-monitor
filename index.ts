import process from "process";
import express  from "express";
import CapturePacketManager from "./capturePacket";

const app = express();

let {
    networkInterfaceId = 'eth0',
    removeOutdataInterval = 10000,
    port = 3001,
    verbose = 'false'
} = process.env;

const capturePacketManager = new CapturePacketManager(networkInterfaceId, ~~removeOutdataInterval, verbose === 'true');

app.get('/stats', (req, res)=>{
    const {
        log
    } = req.query;
    const currentUserAmount = Object.keys(capturePacketManager.statistic.activeUserList).length;

    let returnData = {
        currentUserAmount,
        activeUserList: capturePacketManager.statistic.activeUserList,
        log: <any>[]
    };

    if(log){
        returnData.log = capturePacketManager.statistic.recentLogs;
    }

    return res.json(returnData);
})

app.listen(~~port, ()=>{
    console.log(`server listen at port ${port}`);
})