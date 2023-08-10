import { world, MinecraftBlockTypes, system, ItemStack, ItemTypes } from "@minecraft/server"
import { chatengine } from "./chatengine";
import { config } from "./config";
import { getGamemode, send, updateInv } from "./functionLib";
import {} from "./killcounter";
var dm = world.getDimension("overworld");

system.runInterval(() => {
    try{dm.runCommand(`tag @e remove c_switch`)} catch{}
    try{dm.runCommand(`tag @e[type=c:inv_view,hasItem={item=c:pageswitcher}] add c_switch`)} catch {}
    try{dm.runCommand("clear @a c:pageswitcher")} catch{}
    var enOpt = {} /*EntityQueryOptions*/
    enOpt.excludeTags = ["c_switch"];
    enOpt.type = "c:inv_view";
    enOpt.tags = ["c_ready"];
    var entities = [...world.getDimension("overworld").getEntities(enOpt)];
    
    entities.forEach(entity => {
        if(entity.nameTag.slice(entity.nameTag.length-2)=="§r") {
            var conv = entity.getComponent("minecraft:inventory").container;
            conv.setItem(26)
            // entity.runCommand(`replaceitem entity @s slot.inventory 26 air 1 0`)
            for (let i = 0; i < 18; i++) {
                let item = conv.getItem(i+27)
                if(item) {conv.setItem(i, item)} else {entity.runCommand(`replaceitem entity @s slot.inventory ${i} air`)}
            }
            // entity.runCommand(`replaceitem entity @s slot.inventory 18 c:pageswitcher 1 0`)
            // var pointer = conv.getItem(18)
            var pointer = new ItemStack(ItemTypes.get("c:pageswitcher"),1)
            pointer.nameTag="§r§l§cBack";
            pointer.setLore(["§r§7This may refresh the Inventory"]);
            conv.setItem(18, pointer)
            entity.nameTag=entity.nameTag.substring(0,entity.nameTag.length-1)+"f";
        } else {
            var searchTerm = entity.nameTag.substring(0, entity.nameTag.length-14)
            var player = [...world.getPlayers()].find(player => player.nameTag===searchTerm)
            if(!player) {
                entity.triggerEvent("c:despawn")
                return entity.runCommand(`tellraw @a[tag=team,x=~-1.8,r=1] {"rawtext":[{"text":"§l§cError>> §r§7Couldn't find the player X_X"}]}`)
            }
            
            updateInv(player, entity)
        }
    })

    try{dm.runCommand(`tag @e remove cinv_active`)} catch {}
    try{dm.runCommand(`execute as @a[tag=team] at @s run tag @e[type=c:inv_view,r=2] add cinv_active`)} catch {}
    try{dm.runCommand(`execute as CreepycreeperMw at @s run tag @e[type=c:inv_view,r=2] add cinv_active`)} catch {}
    try{dm.runCommand(`event entity @e[tag=!cinv_active,type=c:inv_view] c:despawn`)} catch {}
})

chatengine()

world.beforeEvents.itemUseOn.subscribe(event=>{
    if(event.source.hasTag("packetblock")==true) event.cancel=true;
    if(event.source.typeId=="minecraft:player") {
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