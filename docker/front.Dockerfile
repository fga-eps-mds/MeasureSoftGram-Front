FROM node:18-buster

COPY . /usr/src/

WORKDIR /usr/src/

RUN yarn

CMD [ "yarn", "dev" ]
