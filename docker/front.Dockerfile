FROM node:18-buster

WORKDIR /usr/src/

ADD . /usr/src/

RUN yarn

RUN yarn build

RUN yarn cache clean

CMD [ "yarn", "dev" ]
