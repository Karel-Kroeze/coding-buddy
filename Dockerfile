FROM node:lts
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g yarn
RUN yarn install

COPY ./dist/ .

EXPOSE 3000
CMD [ "npm", "start" ]