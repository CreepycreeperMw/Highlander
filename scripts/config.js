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
    altarLocation: {x:-1028, y:97, z:-1320},
    teleportButtonLocation: {x:-1028, y:109, z:-1307},
    spawnLocation: {x:-1021, y:108, z:-1322},
    spreadDistance: 600,
    churchPos: {x:-1028, y:108, z:-1314},
    churchAuraRadius: 50,
    innerChurchRadius: 20,
    dimension: "minecraft:overworld",
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
