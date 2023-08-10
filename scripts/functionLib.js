import { world, Player, system, EquipmentSlot, ItemStack, ItemLockMode, Entity, Vector, MolangVariableMap} from "@minecraft/server";
import { config } from "./config";

/**
 * @type {Map<number, {saveCon:(ItemStack|undefined)[], owner: Player}}
 */
export let invStates = new Map()
/**
 * 
 * @param {Player} player Player to display the inventory of
 * @param {Entity} viewingen Entity attached to the Inventory Holder
 * @param {Player} viewer 
 * @param {string} [id] Id to save this operation to. Consider using the viewers player id as this id.
 * @param {boolean} [firstPage=true] 
 * @param {boolean} [reload=true] 
 */
export function updateInv(player, viewingen, viewer, firstPage=true, reload=true) {
    var inv = player.getComponent("minecraft:inventory").container;
    viewingen.nameTag=player.nameTag+"'s Inventory§r";

    var viewingcon = viewingen.getComponent("minecraft:inventory").container
    let saveCon = []
    saveCon.length = inv.size

    for (let i = 0; i < inv.size; i++) {
        var slot = i;
        if(i>17) slot=slot+9;

        if(inv.getItem(i)) {
            var item = inv.getItem(i);
            saveCon[i] = item

            var lore = item.getLore()
            if(i<9) {lore.push("§r§8[Hotbar Slot "+(i+1)+"]")} else {lore.push("§r§8[Inventory Slot "+(i-8)+"]")}
            item.setLore(lore)
            item = getItemInfo(item, player)

            viewingcon.setItem(slot, item)
        } else {viewingen.runCommand(`replaceitem entity @s slot.inventory ${slot} air`)}
    }
    
    let equip = player.getComponent("minecraft:equipment_inventory")

    viewingcon.setItem(20, getItemInfo(equip.getEquipment(EquipmentSlot.head),player,"§r§8[Equipment Slot Head]"))
    viewingcon.setItem(21, getItemInfo(equip.getEquipment(EquipmentSlot.chest),player,"§r§8[Equipment Slot Chest]"))
    viewingcon.setItem(22, getItemInfo(equip.getEquipment(EquipmentSlot.legs),player,"§r§8[Equipment Slot Legs]"))
    viewingcon.setItem(23, getItemInfo(equip.getEquipment(EquipmentSlot.feet),player,"§r§8[Equipment Slot Feet]"))
    viewingcon.setItem(24, getItemInfo(equip.getEquipment(EquipmentSlot.offhand),player,"§r§8[Offhand Slot]"))

    viewingcon.setItem(18)
    var pointer = new ItemStack(ItemTypes.get("c:pageswitcher"),1)
    pointer.nameTag="§r§l§aNext Page";
    viewingcon.setItem(26,pointer)

    invStates.set(viewingen.id, {saveCon, owner:viewer})
}

/**
 * Checks for what changes have been made in the inventory and processes these
 * @param {number} invConId Inventory Container to check referenced by its entity id
 */
export function noticeChanges(invConId) {
    // 1. Check Con Hotbar Slots
    // 2. Check Con Inventory slots
    // 3. Check Con Armor & Offhand Slots

    // 1. Check if item is missing -> push item and set missing amount to conv amount
    // 2. Check if item amount has changed
    
    // 1. Find item stack of missing conv item in players inv
    // 2. clear the instance if instance amount is lower than missing amount
    //    - Else set amount to amount thats left
    // 3. for every instance found substract the missing amount by the amount of the stack thats been found
    // 4. Note the misses left
    // 5. Search for item entity matches in world and remove as needed

    // 1. Merge stacks of identical items (their amount)
    // 2. Find item stack in the viewers inv
    // 3. Replace all matches with the actual item
    // 4. if not strict set amount to amount of player inv
    // 5. else keep doing so until total amount wanted overdid (original amount - missing items)
    //  -> then set amount to remaining amount and clear all other instances

    // STRICT MODE RULES
    // - Enable Strict Mode if in Survival and no op or admin
    // - Disable Strict Mode if in creative
    // - Always enable strict mode if setting forceStrictMode is true
    // - Always disable strict mode if setting strictMode is false
}

/**
 * Assigns item info of the respective item to the items lore.
 * @param {ItemStack} item 
 * @param {Player} player 
 * @param {string} title 
 */
export function getItemInfo(item, player, title) {
    if(!item) return item;
    let lore = item.getLore()

    if(title) lore.push(title)
    // lore.push("§r§8§o"+item.typeId)

    if(item.hasComponent("durability")) {lore.push("§r§7Durability "+(item.getComponent("durability").maxDurability - item.getComponent("durability").damage)+ "/"+item.getComponent("durability").maxDurability)}
    if(item.hasComponent("minecraft:cooldown") && item.getComponent("minecraft:cooldown").cooldownTicks!=0) {try{lore.push("§r§7Cooldown: "+player.getItemCooldown(item.getComponent("minecraft:cooldown").cooldownCategory)+"/"+item.getComponent("minecraft:cooldown").cooldownTicks+" Ticks")} catch {}}
    if(item.lockMode != ItemLockMode.none) lore.push(`§r§7Locked in: ${item.lockMode}`)
    if(item.keepOnDeath) lore.push("§7KeepOnDeath: true")
    // if(item.getTags().length!=0) lore.push(`§r§8Tags: ${item.getTags().join(", ")}`)

    item.setLore(lore)
    return item;
}

export function rainbowart(text) {
    let rbtext = text.split("");
    var rbTNSp = 0;

    for (let i = 0; i < rbtext.length; i++) {

        let color = i+rbTNSp;
        
        while(color > 7) {
            color=color-8;
        }
        if(rbtext[i]==" ") {
            rbTNSp=rbTNSp-1
        }
        if(color==0) {
            rbtext[i]="§c"+rbtext[i];
        }
        if(color==1) {
            rbtext[i]="§6"+rbtext[i];
        }
        if(color==2) {
            rbtext[i]="§e"+rbtext[i];
        }
        if(color==3) {
            rbtext[i]="§a"+rbtext[i];
        }
        if(color==4) {
            rbtext[i]="§2"+rbtext[i];
        }
        if(color==5) {
            rbtext[i]="§3"+rbtext[i];
        }
        if(color==6) {
            rbtext[i]="§1"+rbtext[i];
        }
        if(color==7) {
            rbtext[i]="§5"+rbtext[i];
        }
    }
    return rbtext.join("")
}

// export class Timeout {
//     /**
//      * 
//      * @param {()=>void} callback function to call after specified delay
//      * @param {number} delay delay after which the function is called
//      */
//     constructor(callback, delay, loop = false) {
//         this.progress = 0;

//         let evs = system.runInterval(evt=>{
//             this.progress+=evt.deltaTime
//             if(this.progress>=delay) {
//                 callback()
//                 if(loop==false) system.clearRun(evs)
//                 else this.progress -= delay;
//             }
//         })
//     }
// }
globalThis.stackIndex=0;
globalThis.stack=[];
/**
 * Executes an Callback after an set amount of time.
 * @param {()=>void} callback 
 * @param {number} delay The delay after which the callback function is executed defined in milliseconds
 * @returns 
 */
export function setTimeout(callback, delay) {
    let progress = 0;
    let t = new Date().getTime(); // time
    let id = globalThis.stackIndex
    globalThis.stack.push(id)
    system.run(function evs() {
        var ct = new Date().getTime() //current time
        progress+=(ct-t)
        t = ct;
        if(!globalThis.stack.includes(id)) return;
        if(progress<delay) {
            system.run(evs)
        } else {
            callback()
            globalThis.stack.splice(globalThis.stack.indexOf(id),1)
        }
    })
    globalThis.stackIndex+=1
    return id
}
/**
 * Repeatedly executes an callback after a certain time
 * @param {()=>void} callback 
 * @param {number} interval The interval in which the callback is called, in milliseconds.
 * @returns 
 */
export function setInterval(callback, interval) {
    let progress = 0;
    let t = new Date().getTime(); // time
    let id = globalThis.stackIndex
    globalThis.stack.push(id)
    system.run(function evs() {
        var ct = new Date().getTime() //current time
        progress+=(ct-t)
        t = ct;
        if(!globalThis.stack.includes(id)) return;
        if(progress<interval) {
            system.run(evs)
        } else {
            progress=progress-interval;
            callback()
            system.run(evs)
        }
    })
    globalThis.stackIndex+=1
    return id
}
/**
 * Cancels a custom Timeout and removes it from the stack
 * @param  {...number} id 
 */
export function cancelTimeout(...id) {
    globalThis.stack = globalThis.stack.filter(el=>id.includes(el))
}

/**
 * Makes a pause after a set amount of time and then resolves. (Should be used with await)
 * @param {number} delay The Delay in miliseconds
 * @returns 
 */
export function delay(delay) {
    return new Promise(resolve=>{
        setTimeout(resolve,delay)
    })
}

/**
 * @param {string} nameArg which player to get the name from. To search for original name put an @ before the Name
 * @author CreepycreeperMw
 * @returns {Player | undefined} returns either the Player Object or undefined if no player was found.
 */
 export function getPlayer(nameArg) {
    var player;
    if(nameArg.startsWith("@")) {
        player = [...world.getPlayers()].find(player => player.name===nameArg.slice(1))
    } else {
        player = [...world.getPlayers()].find(player => player.nameTag===nameArg)
    }
    if(player instanceof Player) return player
    return undefined;
}

/**
 * Send a message to a player using your configurated prefix
 * @param {Player} player player(s) to broadcast the message to
 * @param {string} text text to display to the player. Use any character " and \ are also supported like normal.
 */
export function send(player, text, prefix) {
    return player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${prefix??config.chatPrefix} ${text.replace(/\\/gi, "\\\\").replace(/\"/gi, "\\\"")}"}]}`)
}

export function noCmd(player) {
    return player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${config.chatPrefix} §cCannot find this Command X_X"}]}`)
}

export function serverMsg(selector, text) {
    return world.getDimension("overworld").runCommandAsync(`tellraw ${selector} {"rawtext":[{"text":"${config.chatPrefix} ${text.replace(/\\/gi, "\\\\").replace(/\"/gi, "\\\"")}"}]}`)
}
export function broad(text, selector="@a") {
    return world.getDimension("overworld").runCommandAsync(`tellraw ${selector} {"rawtext":[{"text":"${text.replace(/\\/gi, "\\\\").replace(/\"/gi, "\\\"")}"}]}`)
}

/**
 * @param {Player} player The player to get tags from
 * @param {Array<{tag, display}>} ranks Array of Ranks
 * @returns {Array<{tag, display}>} Array of RankObjects
 */
export function getRanks(player, ranks) {
    var playerRanks = [];
    ranks.forEach(rank=>{
        if(player.hasTag(rank.tag)) playerRanks.push(rank)
    })
    return playerRanks
}

export function supString(text) {
    return text.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")
}

export function getCode(count) {
    var chars = ('abcdefghijklmnopqrstuvwxyz'+'0123456789'+'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+'!$%&/()[]{}\\?=*#~,;.:-_|<>^°äöüâêîôû').split('');
    var result = '';
    for (var i = 0; i < count; i++) {
        var x = Math.floor(Math.random() * chars.length);
        result += chars[x];
    }
    return result;
}

export function getGamemode(player) {
    for (let i = 0; i < 9; i++) {
        try{
            player.runCommand(`testfor @s[m=${i}]`);
            return i;
        } catch {}
    }
}

/**
 * Revives a player from being an spectator
 * @param {Player} player 
 * @param {Vector} [location] 
 * @param {import("@minecraft/server").Vector2} [rotation] 
 */
export function revive(player, location, rotation) {
    player.removeTag("spectator")
    player.runCommand("gamemode survival")
    if(location) {
        if(rotation) player.teleport(location,{rotation: rotation})
        // player.dimension.spawnParticle("minecraft:obsidian_glow_dust_particle",location, new MolangVariableMap())
        else player.teleport(location)
    }
}