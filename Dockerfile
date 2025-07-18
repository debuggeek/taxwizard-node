FROM node:6-slim

#Create app directory
WORKDIR /usr/src/fs-node

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY bin/ ./bin/
COPY app.js ./
COPY lib/ ./lib
COPY models/ ./models/
COPY routes/ ./routes/
COPY public/ ./public/
copy views/ ./views/

RUN ls -al

RUN nodejs -v

RUN npm -v

RUN npm install supervisor -g

RUN npm install
# If you are building your code for production
# RUN npm install --only=production


EXPOSE 3000 9229

CMD [ "npm", "start" ]
