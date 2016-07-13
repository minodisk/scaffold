FROM golang:1.6.2-wheezy

# RUN \
#       apt-get update -y && \
#       apt-get install -y \
#         git && \
#       apt-get clean && \
#       rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

RUN go get -u \
      github.com/Masterminds/glide \
      github.com/codegangsta/gin

WORKDIR /go/src/github.com/minodisk/scaffold/api
COPY . .

RUN glide install

CMD go build -o bin/scaffold main.go
