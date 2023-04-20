## Auto-Buff
A mod to automatically use Menma's Brave or Strong Multi-Nostrum based on an abnormality.
Example: If you set bravery for Adrenaline Rush, once that buff runs out, the mod will automatically pop canephora
### Usage
Update the `config.json` file with the abnormality and the consumable you want to use for those abnormalities
* Example
    ```"glaiver": {
        "enabled": true,
        "abnormalities": [702004, 103130],
        "consumableOnAbnormality": "canephora"
    },```
### Commands:
`autobuff` -> Toggle on/off