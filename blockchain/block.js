
const { GENESIS_DATA, MINE_RATE } = require('../config');
const {keccakHash} = require('../utils/index')

const HASH_LENGTH = 64;
const MAX_NONCE_VALUE = 2 ** 64
const MAX_HASH_VALUE = parseInt("f".repeat(HASH_LENGTH),16);

class Block {
constructor({ blockHeaders }) {
this.blockHeaders = blockHeaders;

}

static calculateBlockTargetHash({lastBlock}) {

const value = (MAX_HASH_VALUE/lastBlock.blockHeaders.difficulty).toString(16)

if(value.length > HASH_LENGTH) {

return 'f'.repeat(HASH_LENGTH)

}

return '0'.repeat(HASH_LENGTH - value.length) + value

}

static adjustDifficulty({lastBlock, timestamp}) {

const {difficulty} = lastBlock.blockHeaders

if((timestamp - lastBlock.blockHeaders.timestamp) > MINE_RATE) {

    return difficulty -1; 

}

if (difficulty < 1) {
    return 1
}

return difficulty + 1;
}

static mineBlock({lastBlock, beneficiary}) {

const target = Block.calculateBlockTargetHash({lastBlock})

let timestamp, truncatedBlockheaders, header, nonce, underTargetHash;

do {

timestamp = Date.now();
truncatedBlockheaders = {
parentHash: keccakHash(lastBlock.blockHeaders),
beneficiary,
difficulty: Block.adjustDifficulty({lastBlock, timestamp}),
number: lastBlock.blockHeaders.number + 1,
timestamp
}

header = keccakHash(truncatedBlockheaders);
nonce = Math.floor(Math.random() * MAX_NONCE_VALUE); 
underTargetHash = keccakHash(header + nonce)
} while (underTargetHash > target);


console.log('undertargetHash', underTargetHash)
console.log('target', target) 

return new this({
blockHeaders: {...truncatedBlockheaders, nonce} 
})

}

static genesis() {
return new Block(GENESIS_DATA);
}

static validateBlock({lastBlock, block}) {

return new Promise((resolve, reject)=>{ 


if(keccakHash(block) === keccakHash(Block.genesis()))

return resolve()


if(keccakHash(lastBlock.blockHeaders)!== block.blockHeaders.parentHash){

    return reject(
        new Error("The parent hash must be a hash of the last block's headers")
    )
}


if(block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {

    return reject(new Error("The block must increment the number by "));
}

if(Math.abs(lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty) >1) {

    return reject(new Error('The difficulty must be only adjust by 1'))
}

const target = Block.calculateBlockTargetHash({lastBlock})
const {blockHeaders} = block

const {nonce} = blockHeaders; 

const truncatedBlockheaders = {...blockHeaders};

delete truncatedBlockheaders.nonce;

const header = keccakHash(truncatedBlockheaders)

const underTargetHash = keccakHash(header + nonce) ;

if(underTargetHash > target) {

    return reject(new Error('The block does not meet the proof of work requirement'))
}

return resolve()

})





}




}

module.exports = Block;

