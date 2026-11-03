FROM node:24.14.1-trixie

ADD package.json /usr/src/app/
ADD yarn.lock /usr/src/app/

#Setup Gentex Apt Repository
RUN wget -qO - http://packages.gentex.com/apt/packages.gentex.com.gpg | tee /etc/apt/trusted.gpg.d/packages.gentex.com.gpg
RUN echo "deb [arch=amd64] http://packages.gentex.com/apt noble main" | tee /etc/apt/sources.list.d/packages.gentex.com.list
RUN echo "deb-src [arch=amd64] http://packages.gentex.com/apt noble main" | tee -a /etc/apt/sources.list.d/packages.gentex.com.list

RUN apt-get update && apt-get install redis-server subversion vim git python3-venv -y

RUN mkdir -p /usr/src/app
RUN chown -R node: /usr/src/app

#Devicecomm Python Library
RUN apt-get install -y libdevicecomm6

WORKDIR /usr/src/app/

RUN yarn install

ADD . /usr/src/app/

ENV AUTH_LOCAL=false
ENV APP_ENDPOINT=qa

RUN NODE_ENV=production yarn build

RUN yarn setup:commandsetparser:nosudo

CMD ["yarn", "start"]