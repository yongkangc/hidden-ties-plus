"""
Hidden Ties Plus - A fun M18+ card game for friends and lovers
"""
from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import random
import os

app = Flask(__name__)

def load_packs():
    """Load all card packs from the static/cards directory."""
    packs = []
    cards_dir = os.path.join(app.static_folder, 'cards')
    
    for filename in os.listdir(cards_dir):
        if filename.endswith('.json'):
            with open(os.path.join(cards_dir, filename), 'r', encoding='utf-8') as f:
                pack = json.load(f)
                pack['filename'] = filename.replace('.json', '')
                pack['count'] = len(pack.get('questions', []))
                packs.append(pack)
    
    # Sort by order if specified, otherwise by name
    packs.sort(key=lambda x: (x.get('order', 99), x.get('pack_name', '')))
    return packs

@app.route('/')
def home():
    """Home page - pack selection and game setup."""
    packs = load_packs()
    return render_template('index.html', packs=packs)

@app.route('/play', methods=['GET', 'POST'])
def play():
    """Game play page."""
    if request.method == 'POST':
        selected_packs = request.form.getlist('packs')
        player_count = int(request.form.get('player_count', 2))
        cards_per_player = int(request.form.get('cards_per_player', 10))
        game_mode = request.form.get('game_mode', 'classic')
        
        return redirect(url_for('play', 
                                packs=','.join(selected_packs),
                                player_count=player_count,
                                cards_per_player=cards_per_player,
                                game_mode=game_mode))
    
    # GET request - load and display game
    pack_names = request.args.get('packs', '').split(',')
    player_count = int(request.args.get('player_count', 2))
    cards_per_player = int(request.args.get('cards_per_player', 10))
    game_mode = request.args.get('game_mode', 'classic')
    
    all_packs = load_packs()
    questions = []
    
    for pack in all_packs:
        if pack['filename'] in pack_names or pack['pack_name'] in pack_names:
            for q in pack.get('questions', []):
                questions.append({
                    'text': q if isinstance(q, str) else q.get('text', ''),
                    'type': 'action' if (isinstance(q, dict) and q.get('type') == 'action') or (isinstance(q, str) and any(x in q.lower() for x in ['kiss', 'touch', 'hug', 'hold', 'whisper'])) else 'question',
                    'pack': pack['pack_name'],
                    'spicy': pack.get('spicy_level', 1)
                })
    
    random.shuffle(questions)
    total_cards = min(len(questions), player_count * cards_per_player)
    questions = questions[:total_cards]
    
    return render_template('play.html', 
                          questions=questions, 
                          player_count=player_count,
                          game_mode=game_mode)

@app.route('/about')
def about():
    """About page with game instructions."""
    return render_template('about.html')

@app.route('/api/packs')
def api_packs():
    """API endpoint to get all packs."""
    return jsonify(load_packs())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
