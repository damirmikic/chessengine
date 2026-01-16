# AI Chess Coach

An interactive chess training application powered by Stockfish that provides real-time feedback and analysis to help you improve your chess skills.

![Chess Coach Interface](https://img.shields.io/badge/Chess-Training-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Real-time Move Analysis**: Get instant feedback on every move you make
- **Intelligent Coaching**: Categorizes moves as Good, Inaccuracy, Mistake, or Blunder
- **Detailed Explanations**: When you make a mistake, see the better move and understand why
- **Opening Recognition**: Automatically detects and displays the opening being played
- **Visual Evaluation Bar**: Track position evaluation throughout the game

### Customization
- **Adjustable Difficulty**: Choose from 4 difficulty levels (Easy, Medium, Hard, Master)
- **Play Both Colors**: Switch between playing as White or Black
- **Coaching Mode**: Toggle pause-and-explain feature for deeper learning
- **Undo Functionality**: Take back moves to try different approaches

### Technical Highlights
- Powered by **Stockfish** chess engine for accurate analysis
- Built with **chess.js** for move generation and validation
- Uses **Chessground** for smooth, interactive board interface
- Modern ES6+ JavaScript with module imports
- No build process required - runs directly in the browser

## Setup Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (required for ES6 modules)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/damirmikic/chessengine.git
   cd chessengine
   ```

2. **Serve the application**

   Choose one of the following methods:

   **Using Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Using Node.js (with http-server):**
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**

   Navigate to `http://localhost:8000` in your web browser

## Usage Guide

### Getting Started

1. **Make Your First Move**: Click and drag a piece to make a move
2. **Review Feedback**: After each move, the coach analyzes and provides feedback
3. **Learn from Mistakes**: When mistakes are detected, the system shows:
   - The better move to play
   - Why your move was problematic
   - The opponent's refutation line

### Understanding Feedback

The coach categorizes moves based on evaluation loss:

| Category | Evaluation Loss | Description |
|----------|----------------|-------------|
| **Good Move** | < 0.3 pawns | Solid, accurate play |
| **Inaccuracy** | 0.3 - 1.0 pawns | Passive or slightly inferior |
| **Mistake** | 1.0 - 2.5 pawns | Tactical error |
| **Blunder** | > 2.5 pawns | Major error, losing advantage |

### Controls

- **New Game**: Start a fresh game
- **Undo Move**: Take back your last move(s)
- **Play as Black/White**: Switch colors and start new game
- **Ignore & Continue**: Skip the coaching pause and continue play
- **Pause & Explain Mistakes**: Toggle automatic pause when mistakes are detected

### Difficulty Levels

- **Easy (Beginner)**: Depth 2 - Perfect for new players
- **Medium (Casual)**: Depth 6 - Good for intermediate practice
- **Hard (Club)**: Depth 12 - Challenging for experienced players
- **Master (Pro)**: Depth 18 - Near-perfect play, very difficult

## Project Structure

```
chessengine/
├── index.html          # Main HTML structure
├── script.js           # Main application controller
├── chess-engine.js     # Stockfish communication module
├── board-controller.js # Board UI and move handling
├── analysis.js         # Move analysis and evaluation
├── openings.js         # Opening detection logic
├── style.css           # UI styling
├── stockfish.js        # Stockfish engine (JavaScript)
├── stockfish.wasm      # Stockfish WebAssembly module
├── README.md           # This file
├── package.json        # Project metadata
├── .gitignore          # Git ignore rules
└── LICENSE             # MIT License
```

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **script.js** - Main application orchestrator that coordinates all modules
- **chess-engine.js** - Handles all Stockfish worker communication with retry logic and error handling
- **board-controller.js** - Manages the Chessground board UI and user interactions
- **analysis.js** - Provides move quality classification and evaluation display
- **openings.js** - Detects and displays chess opening names

Each module is:
- Self-contained with clear responsibilities
- Fully documented with JSDoc comments
- Exported as ES6 modules for easy testing and maintenance
- Designed with error handling and user feedback

## Dependencies

All dependencies are loaded via CDN:

- **chess.js** (v0.13.4) - Chess move generation and validation
- **Chessground** (v8.3.3) - Interactive chessboard UI
- **Stockfish.js** - Local chess engine (included in repo)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

ES6 modules and WebAssembly support required.

## How It Works

1. **Move Detection**: When you make a move, it's validated by chess.js
2. **Position Analysis**: Stockfish evaluates both the previous and current positions
3. **Comparison**: The evaluation delta determines move quality
4. **Best Move Search**: For mistakes, the engine finds the optimal move
5. **Refutation Analysis**: Shows how the opponent can punish mistakes
6. **Feedback Display**: Results are presented with color-coded feedback

## Code Quality Features

### Error Handling
- **Automatic Recovery**: Engine failures trigger automatic retry with exponential backoff (up to 3 attempts)
- **Graceful Degradation**: Application continues to function even if engine fails
- **User Feedback**: Clear error messages inform users when issues occur
- **Null Safety**: Comprehensive null checks prevent crashes from missing DOM elements

### Loading States
- **Initialization Feedback**: "Initializing chess engine..." message during startup
- **Analysis Progress**: "Analyzing..." and "Finding better move..." indicators
- **Engine Status**: Real-time status updates ("Engine ready", "Engine error", etc.)

### Documentation
- **JSDoc Comments**: All functions include parameter types, return types, and descriptions
- **Type Definitions**: Custom TypeScript-style type definitions for better IDE support
- **Inline Documentation**: Complex logic explained with clear comments
- **Module Headers**: Each file includes a fileoverview describing its purpose

### Best Practices
- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Dependency Injection**: Callbacks passed to modules for loose coupling
- **Immutable State**: State objects copied before return to prevent external mutation
- **Error Logging**: All errors logged to console for debugging
- **Safe Defaults**: Fallback values prevent crashes when optional parameters missing

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development

Since this project uses ES6 modules, you must run it through a local server during development. File protocol (`file://`) won't work due to CORS restrictions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Stockfish** team for the powerful chess engine
- **chess.js** by Jeff Hlywa for chess logic
- **Chessground** by Lichess for the board interface
- Chess piece images from Wikimedia Commons

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

## Roadmap

Future enhancements may include:
- Move history and game review
- PGN import/export
- Position setup mode
- Multiple engine analysis
- Save/load games
- Performance statistics tracking

---

**Enjoy improving your chess! Every game is a learning opportunity.**
