FROM nginx:stable-alpine

WORKDIR /etc/nginx/conf.d
COPY ./default.conf ./default.conf.tmpl

ARG NODE_PORT
ARG GO_PORT

RUN echo $HOT_LOADER_PORT

RUN printf "cat <<EOS\n$(cat default.conf.tmpl)\nEOS\n" | sh > default.conf &&\
      rm default.conf.tmpl

CMD cat default.conf &&\
  nginx -g 'daemon off;'
