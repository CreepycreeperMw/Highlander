import { world, system, Player } from "@minecraft/server"
import { chatengine } from "./chatengine";
import { config } from "./config";
import { getGamemode, send, spreadPlayerAnimation, vectorDistance, vectorEquals } from "./functionLib";
import {} from "./tick";
import {} from "./killcounter";
import {} from "./reviveMenu";
var dm = world.getDimension("overworld");

if(config.debugMode) {
    Player.prototype.isOp = function() {return false}
}

chatengine()

world.beforeEvents.itemUseOn.subscribe(event=>{
    if(event.source.hasTag("packetblock")==true) event.cancel=true;
    if(event.source instanceof Player && !event.source.isOp()) {
        if(event.itemStack.typeId.toLowerCase()=="minecraft:ender_eye" && event.block.typeId.toLowerCase()=="minecraft:end_portal_frame") {
            event.cancel=true;
            send(event.source, "§7Unfortunately, ender eyes have been disabled.")
        }
        let gm = getGamemode(event.source)
        if(gm!=1) {
            config.forbiddenBlocks.forEach(block => {
                if(event.itemStack.typeId.toLowerCase()==block) {
                    event.cancel=true;
                    event.source.runCommand(`tellraw @a {"rawtext":[{"text":"§l§5Cree§9p§3ixel§fAC§r §8[Partial V]>> §r§c${event.source.nameTag} §7is hacking. Has Illegal Block: §c${block}"}]}`)
                    event.source.runCommand(`clear @s`);
                }
            })
        }
    }
})

world.setDynamicProperty("combatLoggedPlayers",world.getDynamicProperty("combatLoggedPlayers") || "")

world.beforeEvents.playerInteractWithBlock.subscribe(event=>{
    if(event.block.typeId == "minecraft:dark_oak_button" && event.block.dimension.id == config.dimension && vectorEquals(event.block.location,config.teleportButtonLocation)) {
        system.run(()=>spreadPlayerAnimation(event.player, config.spawnLocation, config.spreadDistance))
    }
})

world.beforeEvents.explosion.subscribe(event=>{
    if(
        (event.source && vectorDistance(event.source.location, config.churchPos)<=(config.churchAuraRadius+10)) ||
        (!event.source && 
            event.getImpactedBlocks()[0] &&
            vectorDistance(event.getImpactedBlocks()[0].location, config.churchPos)<=(config.churchAuraRadius+10)
        )
    ) {
        let impactedBlocks = []
        event.getImpactedBlocks().forEach(block=>{
            if(vectorDistance(block.location, config.churchPos) > config.churchAuraRadius) impactedBlocks.push(block)
        })
        event.setImpactedBlocks(impactedBlocks)
    }
})

world.beforeEvents.pistonActivate.subscribe(event=>{
    if(vectorDistance(event.block.location, config.churchPos) > (config.churchAuraRadius+10)) return;
    event.piston.getAttachedBlocks().forEach(block=>{
        if(vectorDistance(block.location, config.churchPos) <= config.churchAuraRadius) event.cancel = true;
    })
})

world.beforeEvents.itemUse.subscribe(event=>{
    if(!event.source?.isOp()
    && config.forbiddenItemsInChurch.includes(event.itemStack.typeId)
    && vectorDistance(event.source.location,config.churchPos) < config.churchAuraRadius) {
        event.cancel = true;
        send(event.source, "§7You can't use this item right now!")
    }
})

world.beforeEvents.playerInteractWithBlock.subscribe(event=>{
    if(!event.player.isOp() && vectorDistance(event.block.location, config.churchPos) < config.churchAuraRadius && !event.block.getItemStack().hasTag("minecraft:door")) {
        event.cancel = true;
    }
})

world.afterEvents.entitySpawn.subscribe(event=>{
    if(event.cause === "Spawned" && vectorDistance(event.entity.location, config.churchPos) < config.churchAuraRadius) {
        if(!config.preventedMobsInChurchAura.includes(event.entity.typeId)) return;
        event.entity.remove()
    }
})