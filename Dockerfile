 FROM node:alpine
 WORKDIR /app

 COPY package*.json ./

 #RUN npm installhhh
 

 RUN npm install --force
 
 COPY . .


 RUN npm run build

 EXPOSE 3000

 CMD ["npm", "start"]
