FROM node:14-alpine

WORKDIR /veera

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 6900

CMD ["npm","start"]