FROM    ubuntu:20.04
RUN     apt-get update
RUN     apt-get -y upgrade 
RUN     apt-get -y install nodejs
RUN     apt-get -y install npm
RUN     apt-get -y install git 
RUN     git clone https://github.com/cmsggg/stageus-dungeonus 
RUN     apt-get -y install postgresql
RUN     apt-get install postgresql-contrib
RUN     apt-get install -y vim
WORKDIR /stageus-dungeonus

#TODO
#CMD    ["node", "server.js"]
#포스트그레 볼륨으로 경로바꿔주는거 추가해야함