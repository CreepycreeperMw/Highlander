import { world, system, Player } from "@minecraft/server"
import { chatengine } from "./chatengine";
import { config } from "./config";
import { getGamemode, send, spreadPlayerAnimation, vectorEquals } from "./functionLib";
import {} from "./tick";
import {} from "./killcounter";
import {} from "./reviveMenu";
var dm = world.getDimension("overworld");

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
world.setDynamicProperty("extraLives",world.getDynamicProperty("extraLives") || "")

world.beforeEvents.playerInteractWithBlock.subscribe(event=>{
    if(event.block.typeId == "minecraft:dark_oak_button" && vectorEquals(event.block.location,config.teleportButtonLocation)) {
        system.run(()=>spreadPlayerAnimation(event.player, config.spawnLocation, config.spreadDistance))
    }
})