 FROM node AS build
 WORKDIR /app

 COPY package*.json ./

 #RUN npm install

 RUN npm install --legacy-peer-deps --force
 
  COPY . .


 RUN npm run build --prod

 EXPOSE 3000

 CMD ["npm", "start"]
