const lodash = require('lodash')
const cbor = require('cbor')
const fs = require('fs');
const crypto = require ('crypto');
const {createHash} = require('crypto')
const {protobuf} = require('sawtooth-sdk')
const axios = require('axios')
const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')

module.exports = {
    cborEncode:function (payload){
        return cbor.encode(payload)
    },
    pad(num, size) {
        var s = "00000000000000000000000000000000000000000000000000000000000000000000000000000" + num;
        return s.substr(s.length-size);
    },
    createTransaction:function(family, version, inputs, outputs, signer, batcher, dependencies, payload) {
        const transactionHeaderBytes = protobuf.TransactionHeader.encode({
            familyName: family,
            familyVersion: version,
            inputs: inputs,
            outputs: outputs,
            nonce:  crypto.randomBytes(512).toString('hex'),
            signerPublicKey: signer.getPublicKey().asHex(),
            batcherPublicKey: batcher.getPublicKey().asHex(),
            dependencies: dependencies,
            payloadSha512: createHash('sha512').update(payload).digest('hex')
        }).finish()
        const signature = signer.sign(transactionHeaderBytes)
        const transaction = protobuf.Transaction.create({
            header: transactionHeaderBytes,
            headerSignature: signature,
            payload: payload
        })
        return transaction
    },
    createBatch: function (transactions, batcher){
        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: batcher.getPublicKey().asHex(),
            transactionIds: transactions.map((txn) => txn.headerSignature),
        }).finish()
        const signature = batcher.sign(batchHeaderBytes)
        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: signature,
            transactions: transactions
        })
        return batch
    },
    createBatchList: function (batches) {
        const batchListBytes = protobuf.BatchList.encode({
            batches: batches
        }).finish()
        return batchListBytes
    },
    submitBatchList: function (baseEndpoint, batchListBytes) {
        const url = 'http://'+baseEndpoint+'/batches'
        console.log(url)
        return axios.post(url, batchListBytes, {headers: {'Content-Type': 'application/octet-stream'}})
    },

    startListening: async function (stream) {
        const sub = EventSubscription.create({eventType: 'ADDER/adder', filters:[]})
        try{
            const r = await stream.send(
                Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
                ClientEventsSubscribeRequest.encode({
                  //lastKnownBlockIds: [NULL_BLOCK_ID],
                  subscriptions: [sub]
                }).finish()
              )
              const decoded = await ClientEventsSubscribeResponse.decode(r)
              if (decoded.status !==ClientEventsSubscribeResponse.Status.OK) {
                  console.log("ERROR")
                  console.log(decoded)
              }
              console.log("Start listening")
              return r;
        }
        catch (e)
        {
            console.log("Error")
            console.log(e)

        }
    },
    createStream: async function(baseEndpoint, cbk) {
        let stream = new Stream('tcp://'+baseEndpoint)
        console.log(stream)
        try{
            await new Promise(resolve => {stream.connect(()=>{this.startListening(stream).then(resolve()).catch(e=>console.log(e))});})

        }
        catch(e){
            console.log(e)
        }
        stream.onReceive(msg => {
            if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
              const events = EventList.decode(msg.content).events
              cbk(events, baseEndpoint);
            } else {
              console.warn('Received message of unknown type:', msg.messageType)
        }})
        return stream
    },
    loadEnv:function (){
        let rawdata = fs.readFileSync('./assets/environment.json');
        let env = JSON.parse(rawdata);
        return env
      }


}