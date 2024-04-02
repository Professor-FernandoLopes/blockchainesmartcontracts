const PubNub = require('pubnub');


const credentials = {

    publishKey: 'pub-c-6ce6f677-c877-4eca-b96d-0ab0caa80d9b',
    subscribeKey: 'sub-c-2f7a63bf-5c12-4142-aef9-0b6eb6deda07',
    userId: '1234'
}

const CHANNELS_MAP = {

    TEST: 'TEST',
    BLOCK: 'BLOCK'
}


class PubSub {

constructor({blockchain}) {

this.pubnub = new PubNub(credentials);
this.blockchain = blockchain
this.subscribeToChannels();
this.listen();
}


subscribeToChannels() {

this.pubnub.subscribe({
channels: Object.values(CHANNELS_MAP)
})

}

publish({channel, message}) {

this.pubnub.publish({channel, message})
}

listen() {

    this.pubnub.addListener({
        message: messageObject => {
        const{channel, message} = messageObject;
        const parsedMessage = JSON.parse(message)
        console.log('Message received', channel);
       
        switch (channel) {
        case CHANNELS_MAP.BLOCK:
        console.log('block message',message) 
        this.blockchain.addBlock({
        block: parsedMessage,}).then(()=> console.log("New block accepted", parsedMessage))
        .catch(error => console.error("New block rejected", error.message));
        break;
        default:
        return;

        }



        }
    })
}

broadcastBlock(block){

    this.publish({
        channel: CHANNELS_MAP.BLOCK,
        message: JSON.stringify(block)
    })


}

}

module.exports = PubSub