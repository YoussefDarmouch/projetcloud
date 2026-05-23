FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY gateway/package*.json ./
RUN npm install --omit=dev

COPY gateway/src ./src

EXPOSE 8080

USER node

CMD ["node", "src/server.js"]
