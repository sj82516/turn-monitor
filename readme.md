# Turn Monitor
Monitor your turn server, no matter what the turn server is.  

## Why use this project  
At the time released this project, the Coturn [#666](https://github.com/coturn/coturn/issues/666) has some issue about statistics.  So I cannot know   
What is current active connection amounts ?   
Is some specific user active right now ?    
How many bandwidth are used by users ?   

## How it works
Turn monitor would listen on network interface and parse every packet to STUN/TURN related packet.  

So it can rely on any TURN server.  

## How to use
You could run by node js or using docker.  

Here are parameters you can use  
name | usage | default vale 
-----|:-----:|-------------
port | The turn monitor server listen at | 3001
verbose | set true if you want to see every parsed TURN messages | false
networkInterfaceId | Which network interface should turn server listen at | eth0  
removeOutdataInterval | How long should turn monitor reset the data | 10000 (10s, should present in ms format).   

Example
```
$ docker --env networkInterfaceId=lo0 --env port=8080 --net=host yuanchieh/turn-monitor
```
If using docker, it must using the same network interface with TURN server. That's why I use `--net=host`.    
Remember the Macos and windows doesn't support host network.  

or 
```
$ npm install
$ networkInterfaceId=lo0 port=8080 ts-node index.ts
```

or 
```
$ npm install 
$ npm run build
$ networkInterfaceId=lo0 port=8080 node build/index.js
```

## The API and response
Only one api `GET /stats?log={boolean}`.  
Set log to true if you want to see the last 1000 parsed TURN messages.  

sample response  with log is true, otherwise the log would return empty string
```json
{
   "currentUserAmount":2,
   "activeUserList":{
      "127.0.0.1:56171":{
         "username":"hello",
         "channelNumber":"4000",
         "bandwidth":1391,
         "lastUpdateTime":"2021-01-05T23:17:09.772Z"
      },
      "127.0.0.1:60718":{
         "username":"hello",
         "channelNumber":"4000",
         "bandwidth":14035,
         "lastUpdateTime":"2021-01-05T23:17:09.819Z"
      }
   },
   "log":[
      {
         "remoteIp":"127.0.0.1:62376",
         "message":{
            "type":"channelData",
            "number":17470,
            "length":256
         },
         "timestamp":"2021-01-05T23:17:01.379Z"
      },
      {
         "remoteIp":"127.0.0.1:58068",
         "message":{
            "type":"channelData",
            "number":17470,
            "length":33155
         },
         "timestamp":"2021-01-05T23:17:01.379Z"
      },
      {
         "remoteIp":"127.0.0.1:56171",
         "message":{
            "type":"stunMessage",
            "class":"request",
            "method":"refresh",
            "transactionId":"3638426662776b784165366a",
            "attributeList":{
               "lifetime":{
                  "length":16,
                  "value":"00000000",
                  "name":"lifetime"
               },
               "username":{
                  "length":24,
                  "value":"hello",
                  "name":"username"
               },
               "realm":{
                  "length":32,
                  "value":"localhost",
                  "name":"realm"
               },
               "nonce":{
                  "length":40,
                  "value":"37373237643431396565623562343732",
                  "name":"nonce"
               },
               "messageIntegrity":{
                  "length":48,
                  "value":"4c8bb5b8f8f677aef9707b8a3125d7f9b463bf21",
                  "name":"messageIntegrity"
               }
            }
         },
         "timestamp":"2021-01-05T23:17:09.772Z"
      },
      {
         "remoteIp":"127.0.0.1:3478",
         "message":{
            "type":"stunMessage",
            "class":"response",
            "method":"refresh",
            "transactionId":"3638426662776b784165366a",
            "attributeList":{
               "lifetime":{
                  "length":16,
                  "value":"00000000",
                  "name":"lifetime"
               },
               "software":{
                  "length":56,
                  "value":"Coturn-4.5.2 'dan Eider'",
                  "name":"software"
               },
               "messageIntegrity":{
                  "length":48,
                  "value":"7aa003c057278874da15c2836fd935aacc58aaaf",
                  "name":"messageIntegrity"
               },
               "fingerprint":{
                  "length":16,
                  "value":"574523d3",
                  "name":"fingerprint"
               }
            }
         },
         "timestamp":"2021-01-05T23:17:09.783Z"
      },
      {
         "remoteIp":"127.0.0.1:3478",
         "message":{
            "type":"channelData",
            "number":16384,
            "length":39
         },
         "timestamp":"2021-01-05T23:17:09.819Z"
      },
      {
         "remoteIp":"127.0.0.1:60718",
         "message":{
            "type":"channelData",
            "number":16384,
            "length":39
         },
         "timestamp":"2021-01-05T23:17:09.819Z"
      },
      {
         "remoteIp":"127.0.0.1:3478",
         "message":{
            "type":"channelData",
            "number":16384,
            "length":39
         },
         "timestamp":"2021-01-05T23:17:09.821Z"
      },
      {
         "remoteIp":"127.0.0.1:60718",
         "message":{
            "type":"stunMessage",
            "class":"request",
            "method":"refresh",
            "transactionId":"4e58623475464d4267712b59",
            "attributeList":{
               "lifetime":{
                  "length":16,
                  "value":"00000000",
                  "name":"lifetime"
               },
               "username":{
                  "length":24,
                  "value":"hello",
                  "name":"username"
               },
               "realm":{
                  "length":32,
                  "value":"localhost",
                  "name":"realm"
               },
               "nonce":{
                  "length":40,
                  "value":"65616264346362363165366433373663",
                  "name":"nonce"
               },
               "messageIntegrity":{
                  "length":48,
                  "value":"e35dc75ba97d2c923e524b0f175b7fb9785a0481",
                  "name":"messageIntegrity"
               }
            }
         },
         "timestamp":"2021-01-05T23:17:09.830Z"
      }
   ]
}
```

## Can I rely on this project
I used in production and it serves well.  
At least it doesn't crash or eating up memory.  
Of course if you find any problem, feel free to open issue.  
If you have any statistic want to see, also welcom to open issue.  