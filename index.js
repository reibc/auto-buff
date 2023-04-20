module.exports = function autoBuffMod(mod){
    const multiNostrum = [280060, 280061];
    let multiBravery = null;
    let multiCane = null;
    const TA2 = 103104;
    const fs = require('fs');
    const filePath = `${__dirname }/data.json`
    const data = fs.readFileSync(filePath, 'utf8');
    const config = require('./config.json')
    let enabled = config.enabled
    let dataObject = JSON.parse(data)
    mod.hookOnce('S_LOGIN', 14, () => {
        var myClass = mod.game.me.class
        if(config.data.hasOwnProperty(myClass) && config.data[myClass].enabled){
            setConsumables().then(() =>{
                autoBuff(config.data[myClass].consumableOnAbnormality, config.data[myClass].abnormalities)
            })
        } 
    })
    function setHooks(){
        return new Promise(resolve => 
            mod.hook('S_PREMIUM_SLOT_DATALIST', 2, event => {
            event.sets.forEach(set =>{
                set.inventory.filter(entry => entry.type === 1).forEach(entry => {
                    if(entry.id == multiNostrum[0]){
                        dataObject.packet.multiBravery = {
                            "set" : set.id,
                            "slot" : entry.slot,
                            "type" : entry.type,
                            "id" : entry.id
                        }
                        multiBravery ={
                            packet:{
                                set: set.id,
                                slot: entry.slot,
                                type: entry.type,
                                id: entry.id
                            }
                        }
                    }
                    else if(entry.id == multiNostrum[1]){
                        dataObject.packet.multiCane = {
                            "set" : set.id,
                            "slot" : entry.slot,
                            "type" : entry.type,
                            "id" : entry.id
                        }
                        multiCane ={
                            packet:{
                                set: set.id,
                                slot: entry.slot,
                                type: entry.type,
                                id: entry.id
                            }
                        }
                    } 
                })
            })
            dataObject.setHook = true
            fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 2), (err) =>{
                if(err) console.log(err)
            })
            resolve(true)
        }))
    }
    async function setConsumables(){
        if(!dataObject.setHook){
            await setHooks()
        }
        multiBravery = {
            packet:{
                set: dataObject.packet.multiBravery.set,
                slot: dataObject.packet.multiBravery.slot,
                type: dataObject.packet.multiBravery.type,
                id: dataObject.packet.multiBravery.id
            }
        }
        multiCane = {
            packet:{
                set: dataObject.packet.multiCane.set,
                slot: dataObject.packet.multiCane.slot,
                type: dataObject.packet.multiCane.type,
                id: dataObject.packet.multiCane.id
            }
        }
    }
    function autoBuff(consumable, abnormalities){
        if(!enabled) return
        if(!multiBravery || !multiCane) return

        mod.hook('S_ABNORMALITY_BEGIN', 4, event => {
            if(!enabled) return
            if(abnormalities.includes(event.id)){
                mod.send('C_USE_PREMIUM_SLOT', 1, consumable == 'bravery' ? multiBravery.packet : multiCane.packet)
            }
        })
        mod.hook('S_ABNORMALITY_END', 1, event => {
            if(!enabled) return
            if(abnormalities.includes(event.id)){
                mod.send('C_USE_PREMIUM_SLOT', 1, consumable == 'bravery' ? multiCane.packet : multiBravery.packet)
            }
        })
    }
    mod.command.add('autobuff', {
        $default(){
            enabled = !enabled;
            mod.command.message(`auto-buff is ${(enabled ? 'enabled' : 'disabled')}`)
            if(enabled){
                let myClass = mod.game.me.class
                autoBuff(config.data[myClass].consumableOnAbnormality, config.data[myClass].abnormalities)
            }
        }
    });

    mod.command.add('updatehook', {
        $default(){
            dataObject.setHook = false;
            fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 2), (err) =>{
                if(err) console.log(err)
            })
            mod.command.message(`Relog to apply the changes!`)
        }
    })
};