export const config = {
    /* Prefix for custom commands */
    cmdPrefix:"!",
    
    /* Prefix for chat messages */
    chatPrefix:"§l§bHighlander§r§8>>§r",

    /* If the addon should complete an automatic installation
    when it detects that it is not installed yet. */
    generateOnLoadAttemp:true,

    /* Blocks that cannot be used by any player without operator
    to prevent any potential abuse. */
    forbiddenBlocks:[
        "minecraft:movingblock",
        "minecraft:netherreactor",
        "minecraft:portal",
        "minecraft:end_portal",
        "minecraft:glowingobsidian"
    ],

    /* strictMode settings are for the
     inv merging functionality */
    strictMode: true,
    forceStrictMode: false,
    cameraYheight: 200,
    altarLocation: {x:-1028, y:97, z:-1320},

    /* location of the button used by players to spread into the distance */
    teleportButtonLocation: {x:-1028, y:109, z:-1307},
    /* central location to spread the players around */
    spawnLocation: {x:-1021, y:108, z:-1322},
    /* maximum distance to spread the players around */
    spreadDistance: 600,
    churchPos: {x:-1028, y:108, z:-1314},
    churchAuraRadius: 50,
    innerChurchRadius: 20,
    /* dimension of the church and logically all of its components that are placed inside it */
    dimension: "minecraft:overworld",
    forbiddenItemsInChurch: [
        "minecraft:bow",
        "minecraft:trident",
        "minecraft:crossbow",
        "minecraft:egg",
        "minecraft:goat_horn",
        "minecraft:fishing_rod",
        "minecraft:splash_potion",
        "minecraft:lingering_potion",
        "minecraft:ender_pearl",
        "minecraft:chorus_fruit",
        "minecraft:name_tag",
        "minecraft:firework_rocket"
    ],
    /* This is for testing the addon and remove any admin checks. */
    debugMode: false,
    removeProjectilesInChurch: true,
    preventedMobsInChurchAura: [
        "minecraft:zombie",
        "minecraft:spider",
        "minecraft:creeper",
        "minecraft:skeleton"
    ]
}
