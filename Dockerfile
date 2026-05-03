FROM node:20-alpine

WORKDDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

CMD ["node", "dist/api/src/server.js"]