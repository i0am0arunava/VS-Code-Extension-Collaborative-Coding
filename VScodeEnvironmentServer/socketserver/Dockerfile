
FROM node:20-alpine AS build


WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

COPY . .


FROM node:20-alpine AS prod

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./


EXPOSE 3000

CMD ["node", "index.js"]
