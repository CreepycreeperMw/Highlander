import { world, system, Player } from "@minecraft/server";
import { broad, setTimeout, send } from "./functionLib";

let deathpoint = new Map()
/**
 * @type {Map<number, number>}
 */
let playerHit = new Map()
/**
 * @type {Map<number, number>}
 */
let combatCooldown = new Map()
/**
 * @type {Map<number, string[]>}
 */
let killsDue = new Map()
/**
 * @type {Map<string, number>}
 */
let extraHp = new Map()
const cooldownTime = 40000
/**
 * 
 * @param {Player} player 
 */
function invincibilityNotifier(player, time = cooldownTime) {
    setTimeout(()=>{
        if(!player.isValid() || !combatCooldown.has(player.id)) return;
        if((new Date().getTime() - combatCooldown.get(player.id)) >= cooldownTime) {
            send(player, "§7Du bist jetzt §anicht mehr gejagt§r","§l§9Info§r§8>>§r")
        } else {
            invincibilityNotifier(player, cooldownTime - (new Date().getTime() - combatCooldown.get(player.id)))
        }
    },time)
}

/**
 * Eliminates a player from the event. Eliminated Players can still
 * spectate the event but not interact with it.
 * @param {string} playerId Id of the player to eliminate
 * @param {string} nameTag Name of the player to eliminate
 * @param {string} suffix Additional info / text appended at the end of the deathmsg
 * @param {boolean} [ackKnowledgeDeath=true] Wether the death should be announced in chat.
 * Defaults to true
 */
export function eliminate(playerId, nameTag, suffix = "", ackKnowledgeDeath = true) {
    let killerId = playerHit.get(playerId)

    let killer = world.getEntity(killerId)
    let player = world.getEntity(playerId)

    if(!killer || !killer.isValid()) {
        killsDue.get(killerId).push(playerId)
    } else {
        let health = killer.getDynamicProperty("extraLives")+
        (Math.floor((player?.getDynamicProperty("extraLives") ?? extraHp.get(playerId))/2) || 1)
        let healthComponent = killer.getComponent("minecraft:health")
        let hp = healthComponent.currentValue
        killer.setDynamicProperty("extraLives",health)
        killer.triggerEvent("max_health_" + (health>10 ? 10 : health))
        healthComponent.setCurrentValue(hp+((player?.getDynamicProperty("extraLives") ?? extraHp.get(playerId))/2 || 1))
    }
    
    if(!player || !player.isValid()) {
        world.setDynamicProperty("combatLoggedPlayers",world.getDynamicProperty("combatLoggedPlayers")+playerId+";")
    } else {
        player.setDynamicProperty("extraLives",0)
        player.triggerEvent("max_health_0")
        player.runCommand("gamemode spectator")
        player.addTag("spectator")
        deathpoint.set(playerId, {loc:player.location,rot:player.getRotation()})
    }
    if(ackKnowledgeDeath) {
        (player?.dimension ?? killer?.dimension ?? world.getDimension("overworld")).runCommandAsync("execute as @a at @s run playsound ambient.weather.thunder @s ~ ~ ~ 1000000 0 100000")

        broad("§l§cDeath§r§8>> §c"+nameTag+" §7has been eliminated"+suffix)        
    }        
    combatCooldown.delete(playerId)
    // player.dimension.spawnEntity("minecraft:lightning_bolt",player.location)
    // hurtEntity.dimension.runCommandAsync("execute as @a at @s run playsound ambient.weather.lightning.impact @s")
}

world.afterEvents.entityHurt.subscribe(({hurtEntity, damageSource, damage})=>{
    if(!(hurtEntity instanceof Player)) return;

    if(damageSource.damagingEntity && damageSource.damagingEntity.typeId=="minecraft:player") {
        playerHit.set(hurtEntity.id, damageSource.damagingEntity.id)
        if(!combatCooldown.has(hurtEntity.id) || (new Date().getTime() - combatCooldown.get(hurtEntity.id)) >= cooldownTime) {
            send(hurtEntity, "§7Du bist jetzt §cgejagt§r§7"+(hurtEntity.hasTag("tipCombat")?'':'. In diesem Zustand kannst du §4sterben§7, da ein Spieler für dein Leid verantwortlich ist.'),"§l§9Info§r§8>>§r")
            hurtEntity.addTag("tipCombat")
            invincibilityNotifier(hurtEntity)
        }
        combatCooldown.set(hurtEntity.id, new Date().getTime())
        // broad(`${hurtEntity.nameTag} was damaged by ${damageSource.damagingEntity.nameTag}`)
    }
    if(hurtEntity.getComponent("minecraft:health").currentValue<=0) {
        hurtEntity.addTag("dead")
        if(combatCooldown.has(hurtEntity.id) && (new Date().getTime() - combatCooldown.get(hurtEntity.id)) < cooldownTime) {
            eliminate(hurtEntity.id, hurtEntity.nameTag)
        }
    }
})

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn})=>{
    if(initialSpawn==false) {
        // Spieler ist respawnt
        player.removeTag("dead")
        if(deathpoint.has(player.id) && player.hasTag("spectator")) {
            player.teleport(deathpoint.get(player.id).loc,{rotation:deathpoint.get(player.id).rot})
            deathpoint.delete(player.id)
        }
    } else {
        let xHp = player.getDynamicProperty("extraLives") ?? 0

        // Set max hp
        if(killsDue.has(player.id)) {
            xHp += killsDue.get(player.id)
            player.setDynamicProperty("extraLives",xHp)
        }
        player.triggerEvent("max_health_" + (xHp>10 ? 10 : xHp))
        killsDue.set(player.id, 0)
        
        if(world.getDynamicProperty("combatLoggedPlayers").includes(player.id+";")) {
            world.setDynamicProperty("combatLoggedPlayers",world.getDynamicProperty("combatLoggedPlayers").replace(player.id+";",""))
            combatCooldown.delete(player.id)

            player.setDynamicProperty("extraLives",0)
            player.triggerEvent("max_health_0")
            player.runCommand("gamemode spectator")
            player.addTag("spectator")
            deathpoint.set(player.id, {loc:player.location,rot:player.getRotation()})

            player.kill()
        }
    }
})

world.afterEvents.playerLeave.subscribe(evt=>{
    if(combatCooldown.has(evt.playerId) && (new Date().getTime() - combatCooldown.get(evt.playerId)) < cooldownTime) {
        eliminate(evt.playerId, evt.playerName, " §7due to combat logging")
        
        let killerId = playerHit.get(evt.playerId)
        let killer = world.getEntity(killerId)
        if(killer instanceof Player) {
            send(killer, "§7A player who was in combat with you has combat logged. He will die and drop his stuff once he rejoins.")
        }
    }
})