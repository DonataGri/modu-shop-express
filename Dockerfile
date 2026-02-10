FROM node:20-alpine
ARG NODE_ENV=dev
ENV NODE_ENV=$NODE_ENV

WORKDIR /app
# copy package.json first to cache dependencies separately from srouce code
COPY package*.json ./
RUN if [ "$NODE_ENV" = "prod" ]; then \
    npm install --production; \
    else npm install; \
    fi

COPY . . 
RUN if [ "$NODE_ENV" = "prod" ]; then \
    npm run build; \
    fi

EXPOSE 3000
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"prod\" ]; then node dist/src/server.js; else npm run start; fi"]
