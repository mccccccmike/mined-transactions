import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Web3 = require("web3");
const web3 = new Web3("wss://eth-mainnet.g.alchemy.com/v2/Q5sH2zvE_fu5H1XI4RC09iQXlSHIbJPS");

const abi = [{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_releaseTime","type":"uint256"}],"name":"mintTimelocked","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[],"name":"MintFinished","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]

var Parse = require('parse/node');
Parse.initialize('X2UmwJ0OHZkXO3oP0UTm4UjmYOmQUy39a3DPSZfK', 'ezaoG88C1uGGWnFawIQ24f9sreYj9AbP6AAu5N3L');
Parse.serverURL = 'https://parseapi.back4app.com/';
async function saveNewContract(name, type, balance, gas, gasUsed, gasPrice, transactionFee, ts, hash) {
  const newContract = new Parse.Object(type);
  newContract.set('name', name);
  newContract.set('balance', balance);
  newContract.set('gas', gas);
  newContract.set('gasUsed', gasUsed);
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

web3.eth.subscribe("newBlockHeaders", async (error, block) => {
  const transactions = (await web3.eth.getBlock(block.number,true)).transactions.filter(transaction => transaction.to === null);
  // console.log(transactions);
  const recipients = await Promise.all(transactions.map(transaction => web3.eth.getTransactionReceipt(transaction.hash)));
  const balances = await Promise.all(recipients.map(recipient => web3.eth.getBalance(recipient.from)));
  // console.log(recipients);
  recipients.forEach((recipient, index) => {
    const balance = web3.utils.fromWei('' + balances[index], 'ether');
    const gas = transactions[index].gas;
    const gasUsed = recipients[index].gasUsed;
    const gasPrice = web3.utils.fromWei(transactions[index].gasPrice, 'gwei');
    const transactionFee = web3.utils.fromWei('' + (gasUsed * transactions[index].gasPrice), 'ether');
    const logs = recipient.logs;
    let type = 'NFT';
    for (const log of logs) {
      if (log.topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' && log.topics.length == 3) {
        // erc20
        type = 'ERC20';
        break;                                                                                                                                                                                                  
      } else {
        // consider everything else is nft contract creation 
      }
    }
    
    const erc20Contract = new web3.eth.Contract(abi, recipient.contractAddress);
    erc20Contract.methods.name().call().then(function(name) {
      erc20Contract.methods.symbol().call((error, symbol) => {
        saveNewContract(name + '-' + symbol || '', type, balance, gas, gasUsed, gasPrice, transactionFee, Date.now(), recipient.transactionHash);
      })
    });
  });
});