FROM ubuntu:24.04 
RUN touch /var/mail/ubuntu && chown ubuntu /var/mail/ubuntu && userdel -r ubuntu

RUN apt-get update && apt-get install -y \
  curl \
  rlwrap \
  gnupg \
  build-essential \
  git \
  vim \
  zip \
  unzip \
  sudo \
  wget \
  gpg


ENV NODE_VERSION 24.14.1

RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
  && case "${dpkgArch##*-}" in \
  amd64) ARCH='x64';; \
  ppc64el) ARCH='ppc64le';; \
  s390x) ARCH='s390x';; \
  arm64) ARCH='arm64';; \
  armhf) ARCH='armv7l';; \
  i386) ARCH='x86';; \
  *) echo "unsupported architecture"; exit 1 ;; \
  esac \
  && set -ex \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENV YARN_VERSION 1.22.22

RUN set -ex \ 
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz

# Development code environment utilities
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  telnet \
  net-tools \
  iputils-ping \
  htop \
  bash-completion \
  time \
  tzdata \
  netcat-traditional \
  lsof \
  dnsutils \
  smbclient \
  subversion

#Setup Gentex Apt Repository
RUN wget -qO - http://packages.gentex.com/apt/packages.gentex.com.gpg | sudo tee /etc/apt/trusted.gpg.d/packages.gentex.com.gpg
RUN echo "deb [arch=amd64] http://packages.gentex.com/apt $(grep UBUNTU_CODENAME /etc/os-release | cut -c 17-) main" | sudo tee /etc/apt/sources.list.d/packages.gentex.com.list
RUN echo "deb-src [arch=amd64] http://packages.gentex.com/apt $(grep UBUNTU_CODENAME /etc/os-release | cut -c 17-) main" | sudo tee -a /etc/apt/sources.list.d/packages.gentex.com.list

RUN sudo apt-get update

#Devicecomm Python Library
RUN apt-get install -y libdevicecomm6

# Download the package to configure the Microsoft repo
RUN curl -sSL -O https://packages.microsoft.com/config/ubuntu/$(grep VERSION_ID /etc/os-release | cut -d '"' -f 2)/packages-microsoft-prod.deb
# Install the package
RUN sudo dpkg -i packages-microsoft-prod.deb
# Delete the file
RUN rm packages-microsoft-prod.deb

# Install the driver
RUN sudo apt-get update
RUN sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 mssql-tools18 unixodbc-dev
# optional: for bcp and sqlcmd
RUN echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc

RUN apt-get update

RUN apt-get install -y python3-venv

RUN groupadd -g 1000 dev && \
  adduser --uid 1000 --gid 1000 --disabled-password dev

# Get Eastern Time zone in the container
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime
RUN dpkg-reconfigure --frontend noninteractive tzdata

# If dev user needs to be sudo, the following can be uncommented
RUN usermod -a -G sudo dev
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Allow for persistent personalization of the development environment
RUN mkdir /home/dev/app \
  && mkdir /home/dev/config \
  && mkdir /home/dev/config/ssh \
  && ln -s /home/dev/config/ssh /home/dev/.ssh \
  && echo "[include]\n  path = /home/dev/config/gitconfig" >> /home/dev/.gitconfig \
  && echo "\n/usr/local/lib/container-init\n\n" >> /home/dev/.bashrc \
  && ln -s /home/dev/config/netrc /home/dev/.netrc \
  && ln -s /home/dev/config/local /home/dev/.local \
  && ln -s /home/dev/config/vimrc /home/dev/.vimrc \
  && echo "\nif [ -f /home/dev/config/bashrc ]; then\n  . /home/dev/config/bashrc\nfi" >> /home/dev/.bashrc

COPY container-init /usr/local/lib
COPY tail-and-wait /usr/local/lib
COPY project-init /usr/local/bin

RUN chmod +x /usr/local/lib/container-init
RUN chmod +x /usr/local/lib/tail-and-wait
RUN chmod +x /usr/local/bin/project-init

ENV HISTFILE=/home/dev/config/histfile
ENV PATH="/opt/mssql-tools18/bin:/home/dev/app/node_modules/.bin:/home/dev/app/util/dev-bin:/home/dev/config/bin:${PATH}:/home/dev/app/.local/bin"
ENV NODE_ENV=development
ENV LANG C.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL C.UTF-8
ENV PLAYWRIGHT_BROWSERS_PATH=/home/dev/.cache
WORKDIR /home/dev/app

# # Playwright install including browsers and dependencies.  Needed during docker build time 
# # so that os-level dependencies stick around after container restart.
RUN yarn add playwright
RUN playwright install chromium --with-deps

ENV DOCKER_ENVIRONMENT	1

RUN chown -R dev:dev /home/dev
USER dev
