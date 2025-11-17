FROM node:18-alpine as build

WORKDIR /app

# Build arguments for environment variables
ARG REACT_APP_API_URL=http://localhost:5000/api
ARG REACT_APP_AI_URL=http://localhost:8000

# Set environment variables from build args
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_AI_URL=$REACT_APP_AI_URL

COPY package*.json ./

# Install dependencies with fallback
RUN npm install --legacy-peer-deps --maxsockets=1 --prefer-offline || \
    (rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --maxsockets=1)

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
