FROM node:24.20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "start"]

# docker build -t mi-app-node .
# docker run -p 4200:4200 mi-app-node
