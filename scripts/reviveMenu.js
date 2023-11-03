import { EquipmentSlot, Player, system, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { revive, send, vectorEquals } from "./functionLib";
import { config } from "./config";

let openForms = new Map()
let triedRebirthTime = new Map()
const loc = {x:0,y:0,z:0}
/**
 * Shows an revive form to a player
 * @param {import("@minecraft/server").Player} player 
 */
async function reviveForm(player) {
    let form = new ModalFormData()

    form.title("Highlander")
    let players = world.getAllPlayers().filter(pl=>pl.hasTag("spectator"))
    form.dropdown("\n§l§fReviving a player\n§r§7You can revive players by trading a totem of undying and 2 of your hearts which can only be obtained by killing a player\n\n§aYou may now select a player to be revived.",["Select a player",...players.map(player=>player.name)])
    let response = await form.show(player)
    
    openForms.set(player.id, false)
    if(response.canceled) return null;

    if(response.formValues[0] == 0) return;
    let target = players[response.formValues[0]-1]

    return target
}

world.beforeEvents.itemUseOn.subscribe(event=>{
    let {source: player, itemStack} = event
    if(!(player instanceof Player) || itemStack.typeId != "minecraft:totem_of_undying" || (openForms.has(player.id) && openForms.get(player.id))) return
    if(!vectorEquals(event.block.location, config.altarLocation)) return
    event.cancel = true

    if(triedRebirthTime.has(player.id) && (new Date().getTime() - triedRebirthTime.get(player.id)) < 3000) return;
    let xHp = player.getDynamicProperty("extraLives")
    if(xHp < 2) {
        triedRebirthTime.set(player.id, new Date().getTime())
        return send(player, `§eDu brauchst (2) Extra Herzen um jemanden zu reviven!`)
    }
    openForms.set(player.id, true)

    system.run(()=>{
        reviveForm(player).then(target=>{
            if(target === null) return;
            if(!target) return send(player,"§7You have to select an online player to revive him");
            if(!target.hasTag("spectator")) return send(player,"§cThis player has been revived while you were selecting him in the menu");
        
            xHp = player.getDynamicProperty("extraLives") -2
            if(xHp < 0) return send(player,"§cDu hast nicht genug Herzen um jemand zu wiederbeleben")
        	player.setDynamicProperty("extraLives",xHp)
        	player.triggerEvent("max_health_" + (xHp>10 ? 10 : xHp))
            player.getComponent("minecraft:equipment_inventory").setEquipment(EquipmentSlot.Mainhand)
            revive(target,player.location)
        }).catch()
    })
})