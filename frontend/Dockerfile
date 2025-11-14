FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
