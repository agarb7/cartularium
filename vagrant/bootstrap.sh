#!/usr/bin/env bash

set -o pipefail
set -o errexit
set -o nounset

APP_ROOT=/vagrant/
BOOTSTRAP_DIR=vagrant/

cd $APP_ROOT

# Enable russian locale
sed -i '/^# ru_RU\.UTF-8 UTF-8/s/^#\s*//' /etc/locale.gen
locale-gen

# Update OS
DEBIAN_FRONTEND=noninteractive apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
DEBIAN_FRONTEND=noninteractive apt-get -y dist-upgrade

# Install Nodejs
curl -sL https://deb.nodesource.com/setup_5.x | bash -
DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

# Install MongoDB
DEBIAN_FRONTEND=noninteractive apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
DEBIAN_FRONTEND=noninteractive apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y mongodb-org

# Install dependencies
npm install

# Install nodemon
npm install -g nodemon

# TODO: nodemon -L app.js at startup

cd $OLDPWD
