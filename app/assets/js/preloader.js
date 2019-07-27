const {ipcRenderer} = require('electron')
const fs            = require('fs-extra')
const os            = require('os')
const path          = require('path')

const ConfigManager = require('./configmanager')
const DistroManager = require('./distromanager')
const LangLoader    = require('./langloader')
const logger        = require('./loggerutil')('%c[Előtöltés]', 'color: #a02d2a; font-weight: bold')

logger.log('Betöltés..')

// Load ConfigManager
ConfigManager.load()

// Load Strings
LangLoader.loadLanguage('hu_HU')

function onDistroLoad(data){
    if(data != null){
        
        // Resolve the selected server if its value has yet to be set.
        if(ConfigManager.getSelectedServer() == null || data.getServer(ConfigManager.getSelectedServer()) == null){
            logger.log('Az alapértelmezetten kiválasztott kiszolgáló meghatározása...')
            ConfigManager.setSelectedServer(data.getMainServer().getID())
            ConfigManager.save()
        }
    }
    ipcRenderer.send('distributionIndexDone', data != null)
}

// Ensure Distribution is downloaded and cached.
DistroManager.pullRemote().then((data) => {
    logger.log('A kiszolgáló index sikeresen betöltve!')

    onDistroLoad(data)

}).catch((err) => {
    logger.log('Nem sikerült betölteni a kiszolgáló indexet!')
    logger.error(err)

    logger.log('Egy régebbi verziót megpróbálunk lekérdezni...')
    // Try getting a local copy, better than nothing.
    DistroManager.pullLocal().then((data) => {
        logger.log('Egy régebbi verzió sikeresen betöltve...')

        onDistroLoad(data)


    }).catch((err) => {

        logger.log('Egy régebbi verziót sem voltunk képesek betölteni.')
        logger.log('Az alkalmazás így nem tudott elindulni.')
        logger.error(err)

        onDistroLoad(null)

    })

})

// Clean up temp dir incase previous launches ended unexpectedly. 
fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if(err){
        logger.warn('Hiba történt a natív könyvtárak takarítása közben:', err)
    } else {
        logger.log('A natív könyvtárakat sikeresen kitakarítottuk!')
    }
})