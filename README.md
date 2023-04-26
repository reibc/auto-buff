## Auto-Buff
A mod to automatically use Menma's Brave or Strong Multi-Nostrum based on an abnormality.  
Tera club is required!  
Example: If you set `Menma's Brave Multi-Nostrum` for Adrenaline Rush, once that buff runs out, the mod will automatically pop `Menma's Strong Multi-Nostrum`
### Usage
Update the `config.json` file with the abnormality and the consumable you want to use for those abnormalities
    `enabled`: true or false  
    `abnormalities`: the abnormality id's for which you want the consumable to pop  
    `bossAbnormality`: set it only for abnormalities that apply on the boss (ex: RB)  
    `consumable`: "canephora" or "bravery"  
    `delayConsumableOnSkill` : optional, the id's for skills which will delay the pop of the consumable. Use it only if the skill can be cancelled by consumables.  
    NOTE: either `abnormalities` or `bossAbnormality` has to be set.  
* Example
    ```
    {
        "enabled": true,
        "data": {
            "warrior": {
                "enabled": false,
                "abnormalities": [103104],
                "consumable": "bravery"
            },
            "glaiver": {
                "enabled": true,
                "abnormalities": [10155130],
                "bossAbnormality": [105309]
                "consumable": "canephora",
                "delayConsumableOnSkill": [46010]
            },
        }
    }
    ```
* Classes names
  ```
        'warrior',
        'lancer',
        'slayer',
        'berserker',
        'sorcerer',
        'archer',
        'priest',
        'elementalist',
        'soulless',
        'engineer',
        'fighter',
        'assassin',
        'glaiver',
### Commands:
`autobuff` -> Toggle on/off  
`autobuff reload` -> reload the module  
`autobuff log start` -> start logging an abnormality (use before starting the abnormality)  
`autobuff log stop` -> stop lopgging an abnormality (use after the abnormality runs out)