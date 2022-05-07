FROM    ubuntu:20.04
ARG	DEBIAN_FRONTEND=noninteractive
RUN     apt-get update
RUN     apt-get -y upgrade 
RUN	apt-get -y install curl
RUN	curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN     apt-get -y install nodejs
RUN     apt-get -y install git
RUN     git clone https://github.com/cmsggg/stageus-dungeonus 
# Postgresql Setting
#RUN     apt-get -y install postgresql
#RUN     apt-get install postgresql-contrib

RUN     apt-get install -y vim

# MongoDB Setting
#RUN	apt-get install -y wget
#RUN	wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
#RUN	echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
#RUN	apt-get update
#RUN	apt-get install -y mongodb-org
#RUN	apt-get install systemctl
WORKDIR /stageus-dungeonus

#TODO
#CMD    ["node", "server.js"]
#포스트그레 볼륨으로 경로바꿔주는거 추가해야함
