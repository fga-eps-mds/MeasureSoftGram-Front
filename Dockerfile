FROM node:lts-alpine

WORKDIR /usr/src/

COPY package.json yarn.lock /usr/src/

RUN yarn

COPY . /usr/src/

RUN yarn build

RUN yarn cache clean

CMD [ "yarn", "dev" ]
