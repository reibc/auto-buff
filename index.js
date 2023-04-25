module.exports = function autoBuffMod(mod){
    const multiNostrum = [280060, 280061];
    let multiBravery = null;
    let multiCane = null;
    let sleep = false
    let sendAbnormality = false
    const fs = require('fs');
    const filePath = `${__dirname }/data.json`
    const data = fs.readFileSync(filePath, 'utf8');
    let config = require('./config.json')
    let hooks = []
    let localHooks = []
    let logObject = {
        'log' : false,
        'abnormalityList': [],
        'abnormalityBegin': [],
        'abnormalityEnd' : []
    }
    let enabled = config.enabled
    let dataObject = JSON.parse(data)
    mod.hook('S_LOGIN', 14, () => {
        let myClass = mod.game.me.class
        if(config.data.hasOwnProperty(myClass) && config.data[myClass].enabled){
            setConsumables().then(() =>{
                autoBuff(myClass)
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
            return
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

    function autoBuff(myClass){
        if(!enabled) return
        if(!multiBravery || !multiCane) return
        let classData = config.data[myClass]
        if(!classData.abnormalities){
            if(!classData.bossAbnormality) {
                mod.command.message(`please set config.json`)
                return
            }
        }
        if(!classData.consumable){
            mod.command.message(`please set config.json`)
            return
        }
        hook('S_ABNORMALITY_BEGIN', 4, {
            filter: {fake:false, silenced:null}
            },event => {
            if(!enabled) return
            if(event.target != mod.game.me.gameId && event.id != classData.bossAbnormality) return
            if((classData.abnormalities?.includes(event.id) ?? false) || (classData.bossAbnormality?.includes(event.id) ?? false)){
                mod.send('C_USE_PREMIUM_SLOT', 1, classData.consumable == 'bravery' ? multiBravery.packet : multiCane.packet)
            }
        })

        if(config.data[mod.game.me.class].delayConsumableOnSkill){
            let delayConsumableOnSkill = config.data[mod.game.me.class].delayConsumableOnSkill
            if (!enabled) return
            hook('C_START_SKILL', 7, event => {
                if(delayConsumableOnSkill.includes(event.skill.id)){
                    sleep = true
                }
            })
            hook('S_ACTION_END',5, {
                "order": -1000000,
                "filter": {
                "fake": true
                }},function(event){
                    if(!enabled) return
                    if(delayConsumableOnSkill.includes(event.skill.id) && !sendAbnormality){
                        sleep = false
                    }
                    if(delayConsumableOnSkill.includes(event.skill.id) && sendAbnormality) {
                        mod.send('C_USE_PREMIUM_SLOT', 1, classData.consumable == 'bravery' ? multiCane.packet : multiBravery.packet)
                        sendAbnormality = false
                        sleep = false
                    }
                }
            )
        }
        hook('S_ABNORMALITY_END', 1, {
            filter: {fake:false, silenced:null}
        },event => {
            if(!enabled) return
            if(event.target != mod.game.me.gameId && event.id != classData.bossAbnormality) return
            if((classData.abnormalities?.includes(event.id) ?? false) && sleep || (classData.bossAbnormality?.includes(event.id) ?? false) && sleep){
                sendAbnormality = true
            } else if((classData.abnormalities?.includes(event.id) ?? false) || (classData.bossAbnormality?.includes(event.id) ?? false)){
                mod.send('C_USE_PREMIUM_SLOT', 1, classData.consumable == 'bravery' ? multiCane.packet : multiBravery.packet)
            }
        })
    }

    function hook() {
		hooks.push(mod.hook(...arguments))
	}

    function unhookAll(){
        sleep = false
        sendAbnormality = false
        hooks.forEach(hook => mod.unhook(hook))
        if(localHooks.length > 0) localHooks.forEach(hook => mod.unhook(hook))
		hooks = []
    }
	mod.game.on('leave_game', () => {
        unhookAll()
    });

    mod.command.add('autobuff', {
        $none(){
            let myClass = mod.game.me.class
            if(!config.data[myClass] || !config.data[myClass].enabled) return
            enabled = !enabled;
            !enabled ? unhookAll() : null
            mod.command.message(`auto-buff is ${(enabled ? 'enabled' : 'disabled')}`)
            if(enabled){
                autoBuff(myClass)
            }
        },
        reload(){
            unhookAll()
            let myClass = mod.game.me.class
            config = reloadModule('./config.json')
            if(config.data.hasOwnProperty(myClass) && config.data[myClass].enabled){
                setConsumables().then(() =>{
                    autoBuff(myClass)
                })
            }
            mod.command.message(`AutoBuff reloaded successfully.`)
            function reloadModule(modToReload){
                delete require.cache[require.resolve(modToReload)];
                return require(modToReload);
            }
        },
        upadehook(){
            dataObject.setHook = false;
            fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 2), (err) =>{
                if(err) console.log(err)
            })
            mod.command.message(`Relog to apply the changes!`)
        },
        log(args){
            function hook() {
                localHooks.push(mod.hook(...arguments))
            }
            function logAbnormality(type, id){
                type == 'begin' ? logObject.abnormalityBegin.push(id) : null
                type == 'end' ? logObject.abnormalityEnd.push(id) : null
                logObject.abnormalityBegin.forEach(element =>{
                    if(logObject.abnormalityEnd && logObject.abnormalityEnd.includes(element) && !logObject.abnormalityList.includes(element)){
                        logObject.abnormalityList.push(element)
                    }
                })
            }
            if(args == 'start'){
                logObject.log = true
                mod.command.message(`Abnormality logging started...`)
                hook('S_ABNORMALITY_BEGIN', 4, event => {
                    if(event.target != mod.game.me.gameId) return
                    logAbnormality('begin', event.id)
                })
                hook('S_ABNORMALITY_END', 1, event => {
                    if(event.target != mod.game.me.gameId) return
                    logAbnormality('end', event.id)
                })
            }
            else if(args == 'stop'){
                mod.command.message(`Abnormalities logged:`)
                logObject.abnormalityList.length == 0 ? mod.command.message(`No abnormalities have been logged.`) : mod.command.message(logObject.abnormalityList)
                localHooks.forEach(hook => mod.unhook(hook))
                localHooks = []
                logObject.log = false
                logObject.abnormalityBegin = []
                logObject.abnormalityEnd = []
                logObject.abnormalityList = []
            }
        }
    });
};