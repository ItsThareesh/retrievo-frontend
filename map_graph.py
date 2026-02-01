graph = {
    "admin_block" : ["swadishtam", "creative_zone", "main_ground", "amul", "rajpath"],
    "swadistam" : ["admin_block", "coops", "gym"],
    "coops" : ["swadistam", "gym"],
    "gym": ["swadishtam", "coops"],
    "creative_zone" : ["admin_block", "bb_court","amul", "rajpath"],
    "amul" : ["main_ground", "nlhc", "admin_block", "bb_court", "creative_zone"],
    "main_ground" : ["admin_block", "nlhc", "amul"],
    "bb_court": [""]

}