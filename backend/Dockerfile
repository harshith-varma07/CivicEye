FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Clean Install
RUN rm -f package-lock.json &&\
    npm install --omit=dev --legacy-peer-deps
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
