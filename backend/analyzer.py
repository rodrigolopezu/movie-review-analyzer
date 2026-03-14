import httpx
import os
from dotenv import load_dotenv

load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

categories = [
  {"keywords": ["amor", "romantica", "romantico", "dulce"], "emojis": ["❤️", "😍", "🌹"]},
  {"keywords": ["accion", "pelea", "explosión", "intensa"], "emojis": ["💥", "🔥", "⚡"]},
  {"keywords": ["miedo", "terror", "horror", "aterrador"], "emojis": ["😱", "👻", "🎃"]},
  {"keywords": ["gracioso", "comedia", "divertida", "chistosa"], "emojis": ["😂", "🤣", "😆"]},
  {"keywords": ["emotiva", "triste", "conmovedora", "llorar"], "emojis": ["😢", "💔", "🥺"]},
  {"keywords": ["espacio", "futuro", "ciencia ficcion", "robot"], "emojis": ["🚀", "🤖", "🌌"]},
  {"keywords": ["aventura", "viaje", "epica", "hazaña"], "emojis": ["🗺️", "⚔️", "🏆"]},
  {"keywords": ["increible", "excelente", "perfecta", "genial"], "emojis": ["⭐", "👏", "🎬"]},
  {"keywords": ["mala", "aburrida", "perdida de tiempo", "terrible"], "emojis": ["👎", "😴", "🗑️"]},
  {"keywords": ["meh", "regular"], "emojis": ["🤔", "😐", "🎭"]}
]

def define_stars(label, score) -> float:
    base = int(label[0])
    
    if score >= 0.85:
        stars = base
    elif score >= 0.60:
        stars = base - 0.5
    else:
        stars = max(0, base - 1)
    
    return max(0, min(5, stars))

def define_sentiment(stars) -> str:
    if stars <= 0.5:
        return "Pésima"
    elif stars <= 1:
        return "Muy malo"
    elif stars <= 1.5:
        return "Decepcionado"
    elif stars <= 2:
        return "Insatisfecho"
    elif stars <= 2.5:
        return "Mediocre"
    elif stars <= 3:
        return "Meh"
    elif stars <= 3.5:
        return "Aceptable"
    elif stars <= 4:
        return "Satisfecho"
    elif stars <= 4.5:
        return "Muy bueno"
    else:
        return "Encantado"

def define_emojis(text,stars):
  found = False
  for categoria in categories:
    for keyword in categoria["keywords"]:
      if keyword in text.lower():
        emojis = categoria["emojis"]
        found = True
        break
    if found:
      break

  if not found:
    if stars >= 4:
      emojis = categories[7]["emojis"]
    elif stars <= 2:
      emojis = categories[8]["emojis"]
    else:
      emojis = categories[9]["emojis"]
  return emojis

def analyze_review(text: str) -> dict:
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": text}
    
    response = httpx.post(
        "https://router.huggingface.co/hf-inference/models/nlptown/bert-base-multilingual-uncased-sentiment",
        headers=headers,
        json=payload
    )
    
    result = response.json()[0]
    best = max(result, key=lambda x: x["score"])
    label = best["label"]
    score = best["score"]
    
    stars = define_stars(label, score)
    emojis = define_emojis(text, stars)
    sentiment = define_sentiment(stars)
    return {"estrellas": stars, "emojis": emojis, "sentimiento": sentiment, "puntaje": score}