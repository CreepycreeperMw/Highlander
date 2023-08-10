scoreboard players remove @e[type=minecraft:armor_stand] xRooms 1
execute as @e[type=minecraft:armor_stand,scores={xRooms=0..,zRooms=0..}] at @s run function "1"
execute as @e[type=minecraft:armor_stand,scores={xRooms=0..,zRooms=0..}] at @s run tp @s ~10 ~ ~
execute as @e[type=minecraft:armor_stand,scores={xRooms=-1,zRooms=0..}] at @s run tp ~-1000 ~ ~10
execute as @e[type=minecraft:armor_stand,scores={xRooms=-1,zRooms=0..}] at @s run scoreboard players remove @s zRooms 1
execute as @e[type=minecraft:armor_stand,scores={xRooms=-1,zRooms=0..}] at @s run scoreboard players set @s xRooms 100
kill @e[type=minecraft:armor_stand,scores={zRooms=-1}]
# event entity @e[type=minecraft:armor_stand,scores={xRooms=-1, zRooms=-1}] c:despawn
# execute as @e[type=minecraft:armor_stand,scores={xRooms=-1,zRooms=0..}] at @s run scoreboard players operation @s xRooms = @s xRoomsConfig