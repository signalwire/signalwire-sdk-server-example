FROM node:16

RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
EXPOSE 5000
CMD ["node", "src/index.js"]