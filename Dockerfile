FROM    ubuntu:20.04
RUN     apt-get update
RUN     apt-get -y upgrade 
RUN     apt-get -y install nodejs
RUN     apt-get -y install npm
RUN	    apt-get install -y npm
RUN     apt-get install git -y
RUN     mkdir /home/dungeonus
RUN     git clone https://github.com/cmsggg/stageus-dungeonus /home/dungeonus
RUN     apt-get install -y postgresql
RUN     apt-get install postgresql-contrib
EXPOSE  5432
RUN     apt-get install -y vim
WORKDIR /home/dungeonus
