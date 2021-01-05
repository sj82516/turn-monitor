import os from "os";
import TurnPacketParser from "turn-packet-parser";

import pcap from "pcap";
import { ChannelData, StunMessage } from "turn-packet-parser/dest/index.types";

type RecordData = {
    remoteIp: string,
    message: StunMessage | ChannelData,
    timestamp: Date
};
type activeUser = {
    channelNumber: number,
    bandwidth: number,
    username: string,
    lastUpdateTime: Date
}
type Statistic = {
    recentLogs: RecordData[],
    activeUserList: {
        [key: string]: activeUser
    }
}

export default class CapturePacketManager {
    private turnPacketParser: TurnPacketParser;
    private localIpList: String[];
    public statistic: Statistic = {
        recentLogs: [],
        activeUserList: {}
    };

    constructor(
        private networkInterface: string, 
        private removeOutdataInterval: number, 
        private verbose: boolean) 
    {
        const networkInterfaces = os.networkInterfaces();
        if (!networkInterfaces[this.networkInterface]) {
            throw "NetworkInterface not exists"
        }
        this.localIpList = this.getLocalIpList();

        const pcap_session = pcap.createSession(this.networkInterface);
        this.turnPacketParser = new TurnPacketParser();
        pcap_session.on('packet', this.packetHandle);

        setInterval(this.removeOutdateUser, this.removeOutdataInterval);
    }

    private packetHandle = (rawPacket: any): void => {
        const packet = pcap.decode.packet(rawPacket);

        if (packet?.payload?.payload) {
            const {
                saddr,
                daddr,
                payload,
            } = packet?.payload?.payload;

            const rawData = payload?.data?.toString('hex');

            if(!saddr || !daddr || !rawData){
                return;
            }

            let remoteIp = `${saddr.addr.join(".")}:${payload?.sport}`;
            if( this.isLocalIp(saddr.addr.join(".")) ){
                remoteIp = `${daddr.addr.join(".")}:${payload?.dport}`;
            }

            if (rawData) {
                const packetData = this.turnPacketParser.parse(rawData);

                if (packetData !== null) {
                    this.storeStatistic({
                        remoteIp,
                        message: packetData,
                        timestamp: new Date()
                    });
                }
            }
        }
    }

    private storeStatistic(data: RecordData): void {
        if(this.verbose) {
            console.log(data.message);
        }

        this.statistic.recentLogs.push(data);
        if (this.statistic.recentLogs.length > 1000) {
            this.statistic.recentLogs.shift();
        }

        if ((<StunMessage>data.message)?.method === 'channelBind'
        ) {
            let message = <StunMessage>data.message;
            if (message.attributeList?.username) {
                this.statistic.activeUserList[data.remoteIp] = {
                    username: <any>message.attributeList.username?.value,
                    channelNumber: <any>message.attributeList.channelNumber?.value,
                    bandwidth: 0,
                    lastUpdateTime: new Date()
                }
            }
        }

        if (this.statistic.activeUserList[data.remoteIp]) {
            if ((<ChannelData>data.message)?.length) {
                let message = <ChannelData>data.message;
                this.statistic.activeUserList[data.remoteIp].bandwidth += message.length;
                this.statistic.activeUserList[data.remoteIp].lastUpdateTime = new Date();
            }
        }
    }

    private removeOutdateUser = () => {
        for (const activeUserIp in this.statistic.activeUserList) {
            const diff = new Date().getTime() - this.statistic.activeUserList[activeUserIp].lastUpdateTime.getTime();
            if (diff > this.removeOutdataInterval) {
                delete this.statistic.activeUserList[activeUserIp];
            }
        }
    }

    private isLocalIp(ip: string): boolean {
        return this.localIpList.includes(ip);
    }
    
    private getLocalIpList() {
        const nets = os.networkInterfaces();
        const results = [];
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    results.push(net.address);
                }
            }
        }
        return results;
    }
}
