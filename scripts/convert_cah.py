#!/usr/bin/env python3
"""Convert Cards Against Humanity JSON to Hidden Ties Plus pack format."""
import json
import re
from pathlib import Path

INPUT_FILE = Path("/tmp/cah-all-full.json")
OUTPUT_DIR = Path(__file__).parent.parent / "static/cards/cah"

def clean_text(text: str) -> str:
    """Remove markdown formatting from card text."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)  # Remove **bold**
    text = re.sub(r'__(.+?)__', r'\1', text)       # Remove __underline__
    text = re.sub(r'(?<![_\w])_([^_]+)_(?![_\w])', r'\1', text)  # Remove _italic_
    return text.strip()

def transform_black_card(card: dict) -> dict:
    """Transform a black (prompt) card."""
    return {
        "text": clean_text(card["text"]),
        "type": "prompt",
        "pick": card.get("pick", 1)
    }

def transform_white_card(card: dict) -> dict:
    """Transform a white (answer) card."""
    return {
        "text": clean_text(card["text"]),
        "type": "answer"
    }

def create_pack(name: str, description: str, cards: list, order: int, emoji: str = "🃏") -> dict:
    """Create a pack in the app's format."""
    return {
        "pack_name": name,
        "pack_description": description,
        "emoji": emoji,
        "order": order,
        "spicy_level": 5,
        "badge": "CAH",
        "category": "cah",
        "questions": cards
    }

def main():
    with open(INPUT_FILE) as f:
        data = json.load(f)
    
    official_packs = [p for p in data if p.get("official")]
    
    # Find base set
    base_pack = next((p for p in official_packs if p["name"] == "CAH Base Set"), None)
    
    # Classic expansions (First through Sixth)
    expansion_names_1 = [
        "CAH: First Expansion", "CAH: Second Expansion", "CAH: Third Expansion",
        "CAH: Fourth Expansion", "CAH: Fifth Expansion", "CAH: Sixth Expansion"
    ]
    expansions_1 = [p for p in official_packs if p["name"] in expansion_names_1]
    
    # Box expansions
    expansion_names_2 = [
        "CAH: Blue Box Expansion", "CAH: Red Box Expansion", 
        "CAH: Green Box Expansion", "Absurd Box Expansion"
    ]
    expansions_2 = [p for p in official_packs if p["name"] in expansion_names_2]
    
    # Family edition
    family_pack = next((p for p in official_packs if "Family Edition" in p["name"]), None)
    
    packs_created = []
    
    # 1. Base Set
    if base_pack:
        cards = []
        for card in base_pack.get("black", []):
            cards.append(transform_black_card(card))
        for card in base_pack.get("white", []):
            cards.append(transform_white_card(card))
        
        pack = create_pack(
            "CAH - Base Set",
            "The original Cards Against Humanity base set",
            cards[:500],
            50
        )
        output_path = OUTPUT_DIR / "cah_base.json"
        with open(output_path, "w") as f:
            json.dump(pack, f, indent=2)
        packs_created.append(("cah_base.json", len(cards[:500])))
        print(f"Created cah_base.json with {len(cards[:500])} cards")
    
    # 2. Classic Expansions (1-6)
    if expansions_1:
        cards = []
        for p in expansions_1:
            for card in p.get("black", []):
                cards.append(transform_black_card(card))
            for card in p.get("white", []):
                cards.append(transform_white_card(card))
        
        pack = create_pack(
            "CAH - Classic Expansions",
            "First through Sixth Expansion packs",
            cards[:500],
            51,
            "📦"
        )
        output_path = OUTPUT_DIR / "cah_expansion_1.json"
        with open(output_path, "w") as f:
            json.dump(pack, f, indent=2)
        packs_created.append(("cah_expansion_1.json", len(cards[:500])))
        print(f"Created cah_expansion_1.json with {len(cards[:500])} cards")
    
    # 3. Box Expansions
    if expansions_2:
        cards = []
        for p in expansions_2:
            for card in p.get("black", []):
                cards.append(transform_black_card(card))
            for card in p.get("white", []):
                cards.append(transform_white_card(card))
        
        pack = create_pack(
            "CAH - Box Expansions",
            "Blue, Red, Green, and Absurd Box expansions",
            cards[:500],
            52,
            "📦"
        )
        output_path = OUTPUT_DIR / "cah_expansion_2.json"
        with open(output_path, "w") as f:
            json.dump(pack, f, indent=2)
        packs_created.append(("cah_expansion_2.json", len(cards[:500])))
        print(f"Created cah_expansion_2.json with {len(cards[:500])} cards")
    
    # 4. Family Edition
    if family_pack:
        cards = []
        for card in family_pack.get("black", []):
            cards.append(transform_black_card(card))
        for card in family_pack.get("white", []):
            cards.append(transform_white_card(card))
        
        pack = create_pack(
            "CAH - Family Edition",
            "The family-friendly version of Cards Against Humanity",
            cards[:500],
            53,
            "👨‍👩‍👧‍👦"
        )
        output_path = OUTPUT_DIR / "cah_family.json"
        with open(output_path, "w") as f:
            json.dump(pack, f, indent=2)
        packs_created.append(("cah_family.json", len(cards[:500])))
        print(f"Created cah_family.json with {len(cards[:500])} cards")
    
    # Summary
    print(f"\n=== Summary ===")
    print(f"Packs created: {len(packs_created)}")
    total = sum(c for _, c in packs_created)
    print(f"Total cards: {total}")
    for name, count in packs_created:
        print(f"  {name}: {count} cards")

if __name__ == "__main__":
    main()
