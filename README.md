# Hidden Ties Plus 💕

A beautiful, modern card game for friends and lovers. Spark conversations, ignite passion, and discover deeper connections.

![Hidden Ties Plus](https://img.shields.io/badge/version-1.0-ff6b9d)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

✨ **Beautiful UI** - Modern, responsive design with smooth animations  
🎴 **8 Card Packs** - From icebreakers to spicy 18+ content  
🔥 **Spice Levels** - Visual indicator of how intense each pack is  
💑 **Multiple Game Modes** - Classic, Hot Seat, Couples, Wild Card  
📱 **Mobile-First** - Swipe gestures and touch-optimized  
🎯 **No Signup Required** - Just open and play  

## Card Packs

| Pack | Cards | Spice | Description |
|------|-------|-------|-------------|
| 🧊 Icebreakers | 30 | 🔥 | Light, fun questions to warm up |
| 💎 Deep Connections | 30 | 🔥🔥 | Meaningful questions to bond |
| 👯 Friends Only | 30 | 🔥🔥 | How well do you know each other? |
| 🌶️ Spicy Truths | 30 | 🔥🔥🔥 | Honest confessions required |
| 💋 Lovers Edition | 40 | 🔥🔥🔥🔥 | Intimate questions for couples |
| 🔥 After Dark | 40 | 🔥🔥🔥🔥🔥 | No limits. Maximum heat. |
| 🍸 Truth or Drink | 30 | 🔥🔥🔥 | Answer or take a shot |
| ⚡ Wild Dares | 30 | 🔥🔥🔥🔥 | Action cards to spice things up |

## Quick Start

### Local Development

```bash
# Clone and enter directory
cd hidden-ties-plus

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run
python app.py
```

Visit http://localhost:5000

### Docker

```bash
docker compose up -d
```

## Deployment to Cloudflare Tunnel

1. Make sure you have cloudflared running
2. Add route in your Cloudflare dashboard:
   - Hostname: `cards.chiayong.com`
   - Service: `http://hidden-ties-plus:5000`

## Adding Custom Cards

Create a JSON file in `static/cards/`:

```json
{
    "pack_name": "My Pack",
    "pack_description": "Short description",
    "emoji": "🎴",
    "order": 10,
    "spicy_level": 3,
    "badge": "18+",
    "questions": [
        "Your question here",
        "ACTION: Your dare here"
    ]
}
```

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: Vanilla HTML/CSS/JS
- **Fonts**: Space Grotesk, Playfair Display
- **Deployment**: Docker + Cloudflare Tunnel

## License

MIT License - feel free to fork and customize!

---

Made with 💕 for deeper connections
