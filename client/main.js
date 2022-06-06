const utils = require('./utils')
const {KeyManager} = require ('./signer');
const { Payload } = require('./payload');
var events0, events4
main()

async function main(){ 
let env = utils.loadEnv()
let eventHandler = (function(events, baseEndpoint) {events.forEach(e=>console.log(baseEndpoint, e.attributes))}).bind(this);
let events0 = await utils.createStream(env.eventEndpoint[0], eventHandler)
let events4 = await utils.createStream(env.eventEndpoint[1], eventHandler)
let keym = new KeyManager()
let transactions = []
let id = "ADDER"
let address = [""]
let payload1 = new Payload("Reset",id,0)
let transaction1 = utils.createTransaction("ADDER","1.0",address,address, keym.getSigner(), keym.getSigner(),[],utils.cborEncode(payload1))   
transactions.push(transaction1)
let payload2 = new Payload("Add",id,env.value)
let transaction2 = utils.createTransaction("ADDER","1.0",address,address, keym.getSigner(), keym.getSigner(),[],utils.cborEncode(payload2))   
transactions.push(transaction2)
let batch = utils.createBatch(transactions, keym.getSigner());
let batchList = utils.createBatchList([batch]);
console.log("ZZ")
let response = utils.submitBatchList(env.apiEndpoint,batchList);
let result = await response

}