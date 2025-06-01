# CS Browser - Counter-Strike Inspired Browser Game

A front-end only implementation of a Counter-Strike inspired shooting game using HTML5 Canvas, JavaScript, and modern web technologies.

## Features

- Classic Counter-Strike inspired gameplay
- Team-based combat (CT vs T)
- Multiple weapon types (pistols, rifles, snipers)
- Realistic weapon mechanics (recoil, spread, damage)
- Buy menu system with economy
- Bot AI with basic tactical behavior
- Animated HUD and UI elements
- Mini-map with player tracking
- Sound effects and ambient audio

## Controls

- **WASD** - Movement
- **Mouse** - Aim
- **Left Click** - Shoot
- **R** - Reload
- **B** - Open buy menu (during buy time)
- **ESC** - Close buy menu

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Click "Start Game" to begin
4. Use the buy menu ('B' key) during buy time to purchase weapons
5. Eliminate the enemy team to win the round

## Weapons

### Pistols
- **Glock** - T side starter pistol
- **USP** - CT side starter pistol

### Rifles
- **AK-47** - T side main rifle
- **M4A1** - CT side main rifle

### Sniper Rifles
- **AWP** - High-powered sniper rifle (both sides)

## Game Mechanics

### Economy
- Round start money: $800
- Kill reward: $300
- Round win: $3250
- Round loss: $1400

### Damage System
- Headshots deal 4x damage
- Armor reduces damage based on weapon penetration
- Different weapons have different accuracy and recoil patterns

### Round System
- 2-minute round timer
- 15-second buy time at round start
- Win by eliminating enemy team or time expiration (CT)

## Technical Details

The game is built using:
- HTML5 Canvas for rendering
- GSAP for animations
- Howler.js for sound effects
- Pure JavaScript for game logic

No backend required - everything runs in the browser!

## Development

### Project Structure
```
├── index.html
├── styles/
│   └── main.css
├── js/
│   ├── config.js
│   ├── sound.js
│   ├── weapons.js
│   ├── player.js
│   ├── bot.js
│   ├── map.js
│   ├── ui.js
│   └── game.js
└── sounds/
    ├── weapons/
    │   ├── glock.mp3
    │   ├── usp.mp3
    │   └── ...
    └── ...
```

### Adding New Features

1. Weapons: Add new weapon configurations in `config.js`
2. Maps: Modify map generation in `map.js`
3. Bot AI: Enhance bot behavior in `bot.js`
4. UI: Add new UI elements in `ui.js`

## Browser Compatibility

Tested and working in:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Tips

- Game runs best on modern browsers with hardware acceleration enabled
- Reduce the number of bots or effects if experiencing performance issues
- Close other resource-intensive tabs for optimal performance

## Known Issues

- Sound may not work in some browsers without user interaction
- Bot pathfinding can sometimes get stuck on complex geometry
- Weapon spread patterns are simplified compared to CS 1.6

## Contributing

Feel free to fork and submit pull requests! Areas that could use improvement:
- More sophisticated bot AI
- Additional weapons and maps
- Enhanced collision detection
- Network multiplayer support

## License

MIT License - feel free to use and modify for your own projects! 