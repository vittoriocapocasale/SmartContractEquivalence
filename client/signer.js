'use strict';

const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')

module.exports = {
  KeyManager: class{
    constructor() {
      this.context = createContext('secp256k1')
      this.pkey=this.context.newRandomPrivateKey();
    }
    getSigner(){
      return new CryptoFactory(this.context).newSigner(this.pkey)
    }
  }
};