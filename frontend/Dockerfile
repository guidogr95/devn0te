FROM node:20-alpine
WORKDIR /app/frontend

ENV NODE_OPTIONS=--max_old_space_size=8192

COPY . .
RUN npm install

EXPOSE 5173
CMD npm run start
