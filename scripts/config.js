export const config = {
    cmdPrefix:"!",
    chatPrefix:"§l§bHighlander§r§8>>§r",
    generateOnLoadAttemp:true,
    forbiddenBlocks:[
        "minecraft:movingblock",
        "minecraft:netherreactor",
        "minecraft:portal",
        "minecraft:end_portal",
        "minecraft:glowingobsidian"
    ],
    strictMode: true, // strictMode settings are for the
    forceStrictMode: false, // inv merging functionality
    cameraYheight: 200,
    altarLocation: {x:-4, y:-60, z:16},
    teleportButtonLocation: {x:0, y:0, z:0},
    spawnLocation: {x:0, y:200, z:0},
    spreadDistance: 600,
    kirchePosition: {x:-1, y:-60, z:8},
    kirchenAuraRadius: 30,
    dimension: "overworld",
    forbiddenItemsInChurch: [
        "minecraft:bow",
        "minecraft:trident",
        "minecraft:crossbow",
        "minecraft:egg",
        "minecraft:goat_horn",
        "minecraft:fishing_rod",
        "minecraft:splash_potion",
        "minecraft:lingering_potion"
    ]
}
