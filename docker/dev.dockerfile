#FROM jshimko/meteor-launchpad:devbuild
FROM debian:stable

RUN apt-get update && apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl

ARG UID=1000

RUN mkdir /app && useradd -m -u ${UID} meteor && chown -Rh meteor /app

USER meteor

RUN curl https://install.meteor.com | sh

# We should be able to do $HOME/.meteor
ENV PATH="$PATH:/home/meteor/.meteor"

RUN echo $PATH

ENV MONGO_URL=""

WORKDIR /app


CMD ["meteor"]