FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies with fallback
RUN npm install --omit=dev --legacy-peer-deps --maxsockets=1 --prefer-offline || \
    (rm -rf node_modules package-lock.json && npm install --omit=dev --legacy-peer-deps --maxsockets=1)

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
