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
 * @type {Map<number, number>}
 */
let killsDue = new Map()
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
            
            // Spieler ist tot
            let killerId = playerHit.get(hurtEntity.id)
            let killer = world.getEntity(killerId)
            if(!killer || !killer.isValid()) {
                killsDue.set(killerId,killsDue.get(killerId)+1)
            } else {
                let health = killer.getDynamicProperty("extraLives")+1
                let healthComponent = killer.getComponent("minecraft:health")
                let hp = healthComponent.currentValue
                killer.setDynamicProperty("extraLives",health)
                killer.triggerEvent("max_health_" + (health>10 ? 10 : health))
                healthComponent.setCurrentValue(hp+2)
            }
            
            hurtEntity.setDynamicProperty("extraLives",0)
            hurtEntity.triggerEvent("max_health_0")
            
            // player.dimension.spawnEntity("minecraft:lightning_bolt",player.location)
            // hurtEntity.dimension.runCommandAsync("execute as @a at @s run playsound ambient.weather.lightning.impact @s")
            combatCooldown.delete(hurtEntity.id)
            hurtEntity.dimension.runCommandAsync("execute as @a at @s run playsound ambient.weather.thunder @s")
            broad("§l§cDeath§r§8>> §c"+hurtEntity.nameTag+" §7has been eliminated")
            hurtEntity.runCommand("gamemode spectator")
            hurtEntity.addTag("spectator")
            deathpoint.set(hurtEntity.id, {loc:hurtEntity.location,rot:hurtEntity.getRotation()})
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
    }
})