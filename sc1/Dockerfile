
FROM ubuntu:bionic

RUN apt-get update \
 && apt-get upgrade -y \
 && apt-get install gnupg -y

LABEL "install-type"="mounted"

RUN echo "deb [arch=amd64] http://repo.sawtooth.me/ubuntu/ci bionic universe" >> /etc/apt/sources.list \
 && echo "deb http://archive.ubuntu.com/ubuntu bionic-backports universe" >> /etc/apt/sources.list \
 && echo 'deb http://ppa.launchpad.net/gophers/archive/ubuntu bionic main' >> /etc/apt/sources.list \
 && (apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 8AA7AF1F1091A5FD \
 || apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 8AA7AF1F1091A5FD) \
 && (apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 308C15A29AD198E9 \
 || apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 308C15A29AD198E9) \
 && apt-get update \
 && apt-get install -y -q \
    build-essential \
    golang-1.11-go \
    git \
    libssl-dev \
    libzmq3-dev \
    openssl \
    python3-grpcio-tools \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV GOPATH=/go

ENV PATH=$PATH:/go/bin:/usr/lib/go-1.11/bin

RUN mkdir /go

WORKDIR /go

RUN go get -u github.com/hyperledger/sawtooth-sdk-go
RUN go get -u github.com/golang/protobuf/proto
RUN go get -u github.com/golang/protobuf/protoc-gen-go
RUN go get -u github.com/golang/mock/gomock
RUN go get -u github.com/golang/mock/mockgen
RUN go get -u github.com/ugorji/go/codec
RUN go get -u github.com/jessevdk/go-flags
RUN go get -u github.com/pebbe/zmq4
RUN go get -u github.com/brianolson/cbor_go
RUN go get -u github.com/btcsuite/btcd/btcec
RUN go get -u github.com/pelletier/go-toml
RUN go get -u github.com/golang/mock/gomock
RUN go get -u github.com/golang/mock/mockgen
RUN go get -u github.com/satori/go.uuid 
RUN go get -u golang.org/x/crypto/ripemd160
RUN go get -u golang.org/x/crypto/ssh    


WORKDIR /go/src/github.com/vittoriocapocasale/doublesc_tp/sc1

COPY . /go/src/github.com/vittoriocapocasale/doublesc_tp/sc1

ENV GOPATH=/go:/go/src/github.com/hyperledger/sawtooth-sdk-go

RUN go install -gcflags '-N -l'

EXPOSE 4004/tcp

CMD ["sc1", "-C", "tcp://validator:4004"]
