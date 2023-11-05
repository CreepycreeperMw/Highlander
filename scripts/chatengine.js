import { world, Player, ItemStack, system, ChatSendBeforeEvent } from "@minecraft/server";
import { config } from "./config";
import { getPlayer, rainbowart, send, getRanks, supString, serverMsg, setTimeout, getItemInfo, revive, updateInv, noCmd, spreadPlayerAnimation } from "./functionLib";

export function chatengine() {
let prefix = config.cmdPrefix
let ranksen;
/**
 * @type {{tag:string, display:string}[]}
 */
let ranks = [];
var ov = world.getDimension("overworld");
var loadAttemp;
/**
 * @type {ItemStack}
 */

function loadAttemp() {
    try{ov.runCommand(`tickingarea add 0 500 0 0 500 0 addon_save`)} catch{}
    setTimeout(()=>{
        var loaded = [...ov.getEntities()][0]
        if(!loaded) return loadAttemp();
        setTimeout(()=>{
            try{ov.runCommand(`scoreboard objectives add legit dummy`)} catch{}
            
            try{ranksen = [...world.getDimension("overworld").getEntities({location: {x:0, y:500, z:0}, closest: 1, type: "c:mr_save", tags: ["ranks"]})][0]} catch {}
            if(!ranksen && config.generateOnLoadAttemp==false) return;
            if(!ranksen && loaded) {
                try{
                    ranksen = world.getDimension("overworld").spawnEntity("c:mr_save",{x:0,y:0,z:0});
                    ranksen.addTag("ranks")
                    ranksen.nameTag=JSON.stringify([
                        {tag:"admin",display:"§l§cAdmin"},
                        {tag:"dev",display:"§l§9Dev"},
                        {tag:"dead",display:"§l§cDEAD"}
                    ])
                } catch(err){console.warn(err)}
            }
            ranksen.runCommand(`tp @s 0 500 0`)
            ranks=JSON.parse(ranksen.nameTag);
            ov.runCommandAsync("gamerule showdeathmessages false")
            ov.runCommandAsync("gamerule sendcommandfeedback false")
        },5000)
    }, 1000)
}
loadAttemp();

var chatCallback;
/**
 * @param {ChatSendBeforeEvent} msg
 * @param {string[]} perms
 */
function chatCallback(msg, perms) {
    //code

    if(msg.message.startsWith(prefix)) {
        /**
         * @type {string[]}
         */
        var args = [];

        msg.message.slice(prefix.length).replace(/\\\"/gi, "»").split('"').forEach(function (curr, num) {
            if (num % 2 == 0) {
                if (curr == " ") return;
                curr.trim().split(" ").forEach((arg) => {
                        args.push(arg.replace(/»/gi, '\\"'));
                    });
            } else {
                args.push(curr.replace(/»/gi, '\\"'));
            }
        });
        if(args[args.length-1]=="") args.pop();

        switch(args[0]) {
            case "invsee":
                if(!perms.includes("admin")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§7Du §9musst §7schon einen §cSpieler angeben§7, dessen Inventar du sehen möchtest... :P`)
                var player = getPlayer(args[1]) 
                if(!(player instanceof Player)) return send(msg.sender, `§7Dieser Spieler §cexistiert nicht`)
                var sender = msg.sender;
                system.run(()=>msg.sender.triggerEvent("c:spawn_inv"))

                setTimeout(()=> {
                    var enOpt = {} /*EntityQueryOptions*/;
                    
                    enOpt.location=sender.location;
                    enOpt.type="c:inv_view";
                    enOpt.maxDistance=3;
                    enOpt.excludeTags=["c_ready"]
                    
                    var viewingen = [...world.getDimension("overworld").getEntities(enOpt)][0]
                    if(!viewingen) return;
                    viewingen.teleport(sender.getHeadLocation())
                    updateInv(player, viewingen)
                    viewingen.addTag("c_ready")
                }, 150)
                break;
            case "install":
                try{ov.runCommand(`kill @e[type=c:mr_save]`)} catch{}
                try{ov.runCommand(`tickingarea add 0 500 0 0 500 0 addon_save`)} catch{}
                try{
                    ranksen = world.getDimension("overworld").spawnEntity("c:mr_save",{x:0,y:0,z:0});
                    ranksen.nameTag=JSON.stringify([
                        {tag:"admin",display:"§l§cAdmin"},
                        {tag:"dev",display:"§l§9Dev"},
                        {tag:"dead",display:"§l§cDEAD"}
                    ])
                    ranksen.addTag("ranks")
                } catch{}
                ranksen.runCommand(`tp @s 0 500 0`)
                ov.runCommandAsync("gamerule showdeathmessages false")
                ov.runCommandAsync("gamerule sendcommandfeedback false")
                break;
            case "sudo":
                if(!perms.includes("sudo")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§cDu dummer Spast musst auch n Spieler angeben..... Sorry`)
                let newSender = getPlayer(args[1]);
                if(!newSender) return send(msg.sender, `§cKonnte diesen Spieler §lnicht §r§cfinden!`)
                // newSender = {...newSender, sendMessage: msg.sender.sendMessage};
                var nmsg={};
                var number = 0;
                if(msg.message.indexOf("\"")==prefix.length+5) {number=2}
                nmsg.sender=newSender;
                // Object.getOwnPropertyNames(newSender).forEach((prop)=>{nmsg.sender[prop]=msg.sender[prop];console.warn(prop)})
                // nmsg.sender.sendMessage = msg.sender.sendMessage;
                // nmsg.sender.sendMessage = msg.sender.sendMessage;
                nmsg.message=msg.message.slice(prefix.length+6+args[1].length+number);
                
                if(nmsg.message.startsWith("/")) {
                    try{nmsg.sender.runCommand(nmsg.message.slice(1))} catch{}
                } else {
                    chatCallback(nmsg, perms)
                }
                break;
            case "nick":
                if(!perms.includes("nick")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§cDu musst einen Nicknamen angeben!`);
                if(msg.message.slice(prefix.length+5).length>24) return send(msg.sender, `§cDer Nickname darf nicht länger als 30 Zeichen sein`)
                msg.sender.nameTag=msg.message.slice(prefix.length+5);
                send(msg.sender, `§7Du wurdest zu §9${msg.message.slice(prefix.length+5)} §7genickt!`)
                break;
            case "unnick":
                if(!perms.includes("nick")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                msg.sender.nameTag=msg.sender.name;
                send(msg.sender, `§aDu wurdest entnickt!`)
                break;
            case "nickPlayer":
                if(!perms.includes("nick")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(args.length<3) return send(msg.sender, `§cDu musst einen Spieler und einen Nicknamen angeben..`)
                if(args[2].length>24) return send(msg.sender, `§cDer Nickname darf nicht länger als 30 Zeichen sein`)
                let nickPlayer = getPlayer(args[1])
                if(!nickPlayer) return send(msg.sender, `§cKonnte diesen Spieler nicht finden XoX`)
                
                var number = 0;
                if(msg.message.indexOf("\"")==prefix.length+11) number=2
                if(args[3]) {
                    nickPlayer.nameTag=msg.message.slice(config.cmdPrefix.length+12+args[1].length+number);
                } else {
                    nickPlayer.nameTag=args[2];
                }
                send(msg.sender, `§7Der Spieler §9${nickPlayer.name} §7wurde erfolgreich zu §a${nickPlayer.nameTag} §7genickt!`)
                break;
            case "unnickPlayer":
                if(!perms.includes("nick")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§7Welchen Spieler soll ich jetzt nochmal genau entnicken?`)

                args[1]=getPlayer(args[1]);
                if(!args[1]) return send(msg.sender, `Konnte diesen Spieler nicht finden XoX`)
                args[1].nameTag=args[1].name;
                send(msg.sender, `§7Der Spieler §9${args[1].name} §7wurde §aerfolgreich §7entnickt!`)
                break;
            case "rank":
                if(!perms.includes("admin")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§r§cDu musst ein Argument angeben:
Syntax: !rank
- add <rankId> <anzeigeNamen>
- edit <rankId> <anzeigeNamen>
- list
- remove <rankId>
<rankId> ist der §lrohe§r §cRangname z.B. 'polizei'. Der Anzeige Name könnte dann '§l§9Polizei§r§c' lauten.`)
                switch(args[1]) {
                    case "add":
                        if(!args[3]) return send(msg.sender, `§cDu musst ein Argument geben:
Syntax: !rank add <rankId> <anzeigeName>
<rankId> ist der §lrohe§r §cRangname z.B. 'polizei'. Der Anzeige Name könnte dann '§l§9Polizei§r§c' lauten.`)
                        ranks.push({tag:args[2],display:args[3]})
                        ranksen.nameTag=JSON.stringify(ranks);
                        send(msg.sender, `§7Neuen Rang §9${args[3]} §r§7erstellt`);
                        break;
                    case "edit":
                        if(!args[3]) return send(msg.sender, `§cDu musst ein Argument geben:
Syntax: !rank edit <rankId> <neuerAnzeigeName>`)
                        var rankindex = ranks.findIndex(rank=>rank.tag==args[2])
                        if(!rankindex) return send(msg.sender, `§cDieser Rang existiert nicht!
Syntax: !rank edit <rankId> <neuerAnzeigeName>`)
                        ranks[rankindex].display=args[3];
                        ranksen.nameTag=JSON.stringify(ranks);
                        send(msg.sender, `§7Der Rang §9${ranks[rankindex].display} §r§7wurde erfolgreich §aumbenannt`)
                        break;
                    case "remove":
                        if(!args) return send(msg.sender, `§cBitte gib an welcher Rang entfernt werden soll!
Syntax: !rank remove <rankId>`);
                        var rankindex = ranks.findIndex(rank=>rank.tag==args[2])
                        if(rankindex<0) return send(msg.sender, `§cDieser Rang existiert nicht!
Syntax: !rank remove <rankId>`)
                        send(msg.sender, `§7Der Rang §9${ranks[rankindex].display} §r§7wurde §cgelöscht`)
                        ranks.splice(rankindex,1);
                        ranksen.nameTag=JSON.stringify(ranks);
                        break;
                    case "list":
                        if(ranks.length==0) return send(msg.sender, "§7Aktuell gibt es keine eingerichteten Ränge")
                        let listmsg = "§9Es gibt folgende Ränge:"
                        ranks.forEach(rank=>{
                            listmsg+="\n§7 - §8"+rank.tag+"§7: ("+rank.display+"§r§7)"
                        })
                        send(msg.sender, listmsg)
                        break;
                    default:
                        send(`§r§c${args[1]} ist kein valides Argument. Du kannst folgende Argumente angeben:
Syntax: !rank
- add <rankId> <anzeigeNamen>
- edit <rankId> <anzeigeNamen>
- list
- remove <rankId>`)
                        break;
                }
                break;
            case "revive": {
                if(!perms.includes("moderator")) return send(msg.sender, `§cIch kann diesen Command nicht finden X_X`)
                if(!args[1]) return send(msg.sender, `§cMissing Arguments: Welcher Spieler sollte wiederbelebt werden?`)

                if(args[1]=="me") args[1] = msg.sender
                else args[1]=getPlayer(args[1]);
                if(!args[1]) return send(msg.sender, `§cKonnte diesen Spieler nicht finden XoX`)

                let location;
                switch (args[2]) {
                    case "here":
                        location=msg.sender.location
                        break;
                    case "there":
                        location = msg.sender.getBlockFromViewDirection({includeLiquidBlocks:true,maxDistance:400,includePassableBlocks:false})
                        if(!location) return send(msg.sender, "§cYou are not looking at an block to revive the player on")
                        location = {
                            x:location.block.location.x+location.faceLocation.x,
                            y:location.block.location.y+location.faceLocation.y,
                            z:location.block.location.z+location.faceLocation.z
                        }
                        break;
                    case undefined:
                    case "noTp":
                        break;
                    default:
                        return send(msg.sender, `§cInvalid argument to spawn the player at. You can either choose 'here', 'there' or 'noTp'`)
                }
                revive(args[1],location)
                break;
            }
            case "help":
                if(!(perms.includes("perms_sudo") || perms.includes("moderator") || perms.includes("perms_nick"))) return noCmd(msg.sender)
                send(msg.sender, `§f---§bHelp§f---
§7You can use one of the following commands:
 - invsee
 - install
 - sudo
 - nick
 - unnick
 - nickPlayer
 - unnickPlayer
 - rank
 - revive
 - help
 - setExtraLives
 - test
 - getPlayerId
 - itemInfo`)
                break;
            case "setExtraLives": {
                if(!perms.includes("admin")) return noCmd(msg.sender);
                if(!args[1]) return send(msg.sender, `§cMissing Arguments: Was soll der neue Wert sein?`)
                
                let newVal = parseInt(args[1])
                let player = args[2] ? getPlayer(args[2]) : msg.sender
                if(isNaN(newVal)) return send(msg.sender, `§cError: Das ist keine valide Zahl. Syntax: ${prefix}setExtraLives <newVal> [target: playerName]`)
                if(!player) return send(msg.sender, `§cKonnte diesen Spieler nicht finden. Syntax: ${prefix}setExtraLives <newVal> [target: playerName]`)

                player.triggerEvent("max_health_" + (newVal>10 ? 10 : newVal))
                player.setDynamicProperty("extraLives", newVal)
                break;
            }
            case "combatlog":{
                if(!perms.includes("moderator")) return noCmd(msg.sender);
                
                let text = "§fThe following players have been flagged as combat logging:§7";
                world.getDynamicProperty("combatLoggedPlayers").split(";").forEach(id=>text+="\n - "+(id||"None"))
                send(msg.sender, text)
                break;
            }
            case "getPlayerId":{
                if(!perms.includes("moderator")) return noCmd(msg.sender);
                var pl = getPlayer(args[1])
                if(!pl) return send(msg.sender,"§cNot a player")

                msg.sender.sendMessage(pl.id)
                break;
            }
            case "itemInfo":{
                if(!perms.includes("moderator")) return noCmd(msg.sender);
                let item = getItemInfo(msg.sender.getComponent("minecraft:inventory").container.getItem(msg.sender.selectedSlot), msg.sender)
                send(msg.sender,`§7Item Info: §r§7\n - Name: ${item.nameTag ?? "None"}§r§7\n - Id: §8${item.typeId}§r§7\n - ${[...item.getLore(),"§7Tags: §8"+(item.getTags().join(", ") || "None")].join("§r§7\n - ")}`)
                break;
            }
            case "spread":
                if(!perms.includes("admin")) return noCmd(msg.sender);
                spreadPlayerAnimation(msg.sender, {x:0,y:200,z:0}, parseInt(args[1]) || 100)
                break;
            case "account":
                break;
            default:
                noCmd(msg.sender)
                break;
        }
    } else {
        if(perms.includes("muted")) return;

        var nMsg = msg.message
        if(perms.includes("rainbow") || perms.includes("admin")) {
            var match = msg.message.match(/§rb(.|\s)*?(?=§)/g)
            if(match) {
                var matches = [...match].reverse();
                [...msg.message.matchAll(/§rb(.|\s)*?(?=§)/g)].reverse().forEach((el,i)=>{
                    nMsg = nMsg.substring(0, el.index) +
                    rainbowart(matches[i].slice(3)) +
                    nMsg.substring(el.index+matches[i].length,nMsg.length);
                })
            }
            msg.message = nMsg;
            var endmatch = msg.message.match(/§rb(.|\s)+/)
            if(endmatch) {
                endmatch = [...endmatch][0]
                msg.message = msg.message.replace(/§rb(.|\s)+/, rainbowart(endmatch.slice(3)))
            }
        }
        if(!(perms.includes("rainbow"))) {
            msg.message = msg.message.replace(/§/gi, "&")
        }

        var rank = getRanks(msg.sender, ranks)[0];

        if(perms.includes("admin") && msg.message.startsWith("#")) {
            serverMsg("@a","§7"+(msg.message.startsWith("# ") ? msg.message.slice(2) : msg.message.slice(1)).replace(/§r/g,""))
            return;

            // "§8[§l§cSPECTATOR§r§8] §rCreepy§8: §o§7"
        }
        if(msg.sender.hasTag("spectator")) return msg.sender.runCommand(`tellraw @a[tag=spectator] {"rawtext":[{"text":"§8[§l§cDEAD§r§8] §r§7${supString(msg.sender.nameTag)}§8: §o§7${supString(msg.message)}"}]}`),msg.sender.runCommand(`tellraw @a[tag=team,tag=!spectator] {"rawtext":[{"text":"§8[§l§cDEAD§r§8] §r§7${supString(msg.sender.nameTag)}§8: §o§7${supString(msg.message)}"}]}`);
        if(!rank) return msg.sender.runCommand(`tellraw @a {"rawtext":[{"text":"§l§aAlive §r§8| §r${supString(msg.sender.nameTag)}§7: §r${supString(msg.message)}"}]}`);
        msg.sender.runCommand(`tellraw @a {"rawtext":[{"text":"${supString(rank.display)} §r§8| §r${supString(msg.sender.nameTag)}§7: §r${supString(msg.message)}"}]}`)
    }
};

world.beforeEvents.chatSend.subscribe(msg=> {
    msg.sendToTargets=true
    msg.setTargets([])
    if(msg.message.startsWith(prefix) && !msg.message.toLowerCase().startsWith("!account")) msg.cancel = true;

    let perms = [];
    var tags = msg.sender.getTags()
    if(tags.includes("admin")||msg.sender.name=="CreepycreeperMw"||msg.sender.isOp()) {
        perms.push("admin")
    }
    if(tags.includes("perms_sudo")||perms.includes("admin")) {
        perms.push("sudo");
    }
    if(tags.includes("moderator")||perms.includes("admin")) {
        perms.push("moderator");
    }
    if(tags.includes("perms_rainbowtext")||perms.includes("moderator")) {
        perms.push("rainbow");
    }
    if(tags.includes("perms_nick")||perms.includes("admin")) {
        perms.push("nick");
    }
    if(tags.includes("muted")){
        perms.push("muted")
    }
    if(perms.includes("muted")&&(!msg.message.startsWith(prefix))) return send(msg.sender,`§7You are currently §c§lMUTED`);
    if(perms.includes("admin") && msg.message.startsWith("#")) msg.cancel = true;
    system.run(()=>chatCallback(msg, perms))
})
}