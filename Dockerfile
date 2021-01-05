FROM node:14.15.4

RUN apt-get update
RUN apt-get install -y libpcap-dev

WORKDIR /etc/app
COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

CMD node build/index.js