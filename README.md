# Tank Battle Game

A 2D tank battle game built with HTML5 Canvas and JavaScript where you control a tank and fight against AI opponents.

## How to Play

1. **Movement**: Use WASD keys to control your tank
   - W: Move forward
   - S: Move backward
   - A: Rotate tank body left
   - D: Rotate tank body right

2. **Aiming**: Move your mouse to aim the tank's turret (independent of tank body)

3. **Shooting**: Click the mouse to fire bullets

4. **Objective**: Destroy all enemy tanks before they destroy you!

## Game Features

- **Player Tank**: Green tank that you control
- **Enemy Tanks**: Red AI-controlled tanks that rotate and move realistically
- **Multiple Levels**: 5 progressively challenging levels with different layouts
- **Obstacles**: Brown barriers that block movement and bullets
- **Health System**: Both you and enemies have health bars
- **Collision Detection**: Tanks can't move through obstacles
- **Bullet Physics**: Bullets travel in straight lines and can be blocked by obstacles
- **AI Behavior**: Enemies rotate their tanks and move towards you, shooting when in range
- **Score System**: Earn points for destroying enemies
- **Level Progression**: Advance through levels by defeating all enemies
- **Game Over**: Win by completing all levels or lose if your tank is destroyed

## Controls Summary

- **W**: Move tank forward
- **S**: Move tank backward
- **A**: Rotate tank body left
- **D**: Rotate tank body right
- **Mouse**: Aim turret (independent of tank body)
- **Left Click**: Shoot
- **Restart Button**: Start a new game after winning or losing

## Technical Details

- Built with vanilla JavaScript and HTML5 Canvas
- No external dependencies required
- Responsive design with modern UI
- Smooth 60 FPS gameplay
- Object-oriented architecture with classes for tanks, bullets, and obstacles

## Running the Game

Simply open `index.html` in any modern web browser. The game will start automatically!

## Game Mechanics

- **Tank Speed**: Player tanks move at 3 pixels per frame, AI tanks at 2 pixels per frame
- **Tank Rotation**: A/D keys rotate tank body, mouse controls turret independently
- **Bullet Speed**: 8 pixels per frame
- **Damage**: Player bullets deal 25 damage, enemy bullets deal 20 damage
- **Health**: All tanks start with 100 health
- **Shooting Cooldown**: 300ms for player, 1000ms for AI
- **AI Range**: Enemies can shoot from any distance (no range limit)
- **Levels**: 5 progressively harder levels with more enemies and complex layouts

## Level Overview

1. **Training Ground**: Basic layout with 3 enemies
2. **Urban Warfare**: More obstacles and 5 enemies
3. **Maze Runner**: Complex maze-like layout with 6 enemies
4. **Fortress Assault**: Fortress-style layout with 8 enemies
5. **Final Battle**: Ultimate challenge with 10 enemies in a complex grid

Enjoy the battle! 