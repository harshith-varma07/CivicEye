FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Clean install
RUN rm -f package-lock.json && \
    npm install --omit=dev --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
