FROM node:18-buster

WORKDIR /usr/src/

RUN yarn

CMD [ "yarn", "dev" ]
