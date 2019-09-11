// Work in progress
const logger = require('./loggerutil')('%c[Discord]', 'color: #7289da; font-weight: bold')

const {Client} = require('discord-rpc')

let client
let activity

exports.initRPC = function(genSettings, servSettings, initialDetails = 'Waiting for Client..'){
    client = new Client({ transport: 'ipc' })
    
    activity = {
        state: 'Verzió: ' + servSettings.shortId,
        largeImageKey: servSettings.largeImageKey,
        startTimestamp: new Date().getTime(),
        instance: true
    }

    client.on('ready', () => {
        logger.log('A Discord Rich Presence sikeresen elindult!')
        client.setActivity(activity)
    })
    
    client.login({clientId: genSettings.clientId}).catch(error => {
        if(error.message.includes('ENOENT')) {
            logger.log('Nem lehet elindítani a Discord RPC-t, mert nem észlelhető Discord kliens a gépen.')
        } else {
            logger.log('Nem lehet elindítani a Discord RPC-t: ' + error.message, error)
        }
    })
}

exports.updateDetails = function(details){
    activity.details = details
    client.setActivity(activity)
}

exports.shutdownRPC = function(){
    if(!client) return
    client.clearActivity()
    client.destroy()
    client = null
    activity = null
}