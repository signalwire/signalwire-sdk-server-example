FROM node:16

RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
COPY src ./src
RUN npm install
EXPOSE 5000
CMD ["node", "src/index.js"]