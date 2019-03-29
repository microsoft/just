# Stage 1: puppeteer

FROM node:10-alpine as puppeteer

# Installs latest Chromium package.
RUN apk update && apk upgrade && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
  echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
  apk add --no-cache \
  chromium@edge \
  harfbuzz@edge \
  nss@edge \
  git \
  && rm -rf /var/cache/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Stage 2: Use puppeteer

FROM puppeteer
RUN git config --global user.email "someexample@somedomainyeahsomething.com" && git config --global user.name "Your Name"
WORKDIR /app/packages/just-scenario-tests/
CMD ["/usr/local/bin/npm", "run", "_dockerTest"]