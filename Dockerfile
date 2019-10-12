FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf

FROM node:10-alpine AS base

FROM base AS dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache --virtual .gyp python make g++ inotify-tools
RUN npm install

FROM base as build
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . ./

RUN chown -R node: /usr/src/app
USER node

CMD npm start
EXPOSE 4000