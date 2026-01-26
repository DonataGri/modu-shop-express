ARG NODE_ENV=dev
FROM node:20-alpine
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
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"prod\" ]; then node dist/main.js; else npm run start:dev; fi"]
