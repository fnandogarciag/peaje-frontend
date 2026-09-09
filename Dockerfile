# Build stage
FROM node:24-alpine 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "1000"]

# docker build -t frontend .
# docker run -d --name frontend-container -p 0.0.0.0:4200:4200 -v "${PWD}:/app" -v /app/node_modules frontend