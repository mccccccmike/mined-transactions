import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Web3 = require('web3');
var Parse = require('parse/node');

Parse.initialize('X2UmwJ0OHZkXO3oP0UTm4UjmYOmQUy39a3DPSZfK', 'ezaoG88C1uGGWnFawIQ24f9sreYj9AbP6AAu5N3L');
Parse.serverURL = 'https://parseapi.back4app.com/';
async function saveNewContract(name, type, balance, gas, gasPrice, transactionFee, ts, hash) {
  const newContract = new Parse.Object('NewContract');
  newContract.set('name', name);
  newContract.set('type', type);
  newContract.set('balance', balance);
  newContract.set('gas', gas);
  newContract.set('gasPrice', gasPrice);
  newContract.set('transactionFee', transactionFee);
  newContract.set('timestamp', ts);
  newContract.set('hash', hash);
  try {
    const result = await newContract.save();
    console.log('New object created with objectId: ' + result.id);
  } catch (error) {
    console.log('Failed to create new object: ' + error.message);
  }
}

let query = new Parse.Query('NewContract');
let subscription = await query.subscribe();

subscription.on('open', () => {
  console.log('subscription opened');
 });

 subscription.on('create', (object) => {
  console.log('object created' + object);
});

subscription.on('update', (object) => {
  console.log('object updated' + object);
});

subscription.on('enter', (object) => {
  console.log('object entered' + object);
});

subscription.on('leave', (object) => {
  console.log('object left' + object);
});

subscription.on('delete', (object) => {
  console.log('object deleted' + object);
});

subscription.on('close', () => {
  console.log('subscription closed');
});

Parse.LiveQuery.on('open', () => {
  console.log('socket connection established');
});

Parse.LiveQuery.on('close', () => {
  console.log('socket connection closed');
});

Parse.LiveQuery.on('error', (error) => {
  console.log(error);
});