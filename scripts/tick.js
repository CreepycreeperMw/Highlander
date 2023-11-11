import { world, system, ItemStack, ItemTypes, GameMode } from "@minecraft/server"
import { config } from "./config";
import { normalizeVector2, updateInv, vectorAdd, vectorDistance, vectorMinus, vectorMultiply } from "./functionLib";
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

            // Main Flip sequence
            conv.setItem(26)
            for (let i = 0; i < 18; i++) {
                let item = conv.getItem(i+27)
                conv.setItem(i, item)
            }

            // End & Set Pointer
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

    [...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, families: ["monster"]})
    ,...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, families: ["tnt"]})
    ,...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, type: "minecraft:arrow", minDistance: config.innerChurchRadius})
    ,...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, type: "minecraft:snowball", minDistance: config.innerChurchRadius})
    ,...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, families: ["minecart"]})].forEach(entity=>{
        if(entity.typeId=="minecraft:player" || !entity.isValid()) return;
        entity.dimension.spawnParticle("minecraft:knockback_roar_particle",entity.location)
        entity.clearVelocity()
        entity.applyImpulse(
            vectorAdd(
                vectorMultiply(
                    normalizeVector2(
                        vectorMinus(entity.location, config.churchPos)
                    ), 0.5
                ),
                { y: 0.5 }
            )
        )
    });

    [
        ...dm.getEntities({location:config.churchPos, maxDistance: config.churchAuraRadius, type:"minecraft:ender_crystal"}),
        // ...dm.getEntities({location:config.churchPos, maxDistance: config.innerChurchRadius, type: "minecraft:snowball"}),
        ...(config.removeProjectilesInChurch?[...dm.getEntities({location:config.churchPos, maxDistance: config.innerChurchRadius, type: "minecraft:arrow"}),
        ...dm.getEntities({location:config.churchPos, maxDistance: config.innerChurchRadius, type: "minecraft:trident"})]:[]),
        ...dm.getEntities({location:config.churchPos, maxDistance: config.innerChurchRadius, families: ["monster"]})
    ].forEach(entity=>{
        entity.remove()
    });

    // Get all players that were previously in church but are no longer
    [
        ...dm.getPlayers({location: config.churchPos, minDistance: config.churchAuraRadius, tags: ["church"]}),
        ...world.getDimension("nether").getPlayers({tags: ["church"]}),
        ...world.getDimension("the_end").getPlayers({tags: ["church"]})
    ].forEach(player=>{
        player.removeTag("church")
        player.triggerEvent("vurnable")
        player.runCommandAsync("gamemode s @s[m=a]")
    })

    // Get all players that are in church and make them invurnable
    dm.getPlayers({location: config.churchPos, maxDistance: config.churchAuraRadius}).forEach(player=>{
        if(!player.hasTag("church")) {
            player.addTag("church")
            player.triggerEvent("invurnable")
            player.runCommandAsync("gamemode a @s[m=s]")
        }
    })

    dm.runCommandAsync("execute as @e[type=c:entity,tag=reviveParticle] at @s positioned ~ ~1.4 ~ run particle minecraft:endrod ^ ^ ^0.4")
    dm.runCommandAsync("execute as @e[type=c:entity,tag=reviveParticle] at @s positioned ~ ~1.4 ~ run particle minecraft:basic_portal_particle ^ ^ ^-0.4")
    dm.runCommandAsync("execute as @e[type=c:entity,tag=reviveParticle] at @s positioned ~ ~1.4 ~ run particle minecraft:basic_portal_particle ^ ^ ^-0.4")
    dm.runCommandAsync("execute as @e[type=c:entity,tag=reviveParticle] at @s run tp @s ~ ~ ~ ~5 ~")

    world.getPlayers({tags: ["in_combat"], excludeGameModes: [GameMode.spectator, GameMode.creative]}).forEach(player=>{
        if(vectorDistance(player.location, config.churchPos) > config.churchAuraRadius) return;

        const {x,z} = vectorMinus(player.location, config.churchPos)
        player.applyKnockback(x, z, config.horizontalPlayerKb, config.verticalPlayerKb)
    })
})