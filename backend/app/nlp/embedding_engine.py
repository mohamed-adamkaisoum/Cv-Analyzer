# vectorisation dial les textes bach lmodel y9der y3ref ra python dev == developpeur python 



from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

def embed_text(text):
    return model.encode(text)




def similarity(text1, text2):
    v1 = embed_text(text1)
    v2 = embed_text(text2)

    score = cosine_similarity([v1], [v2])[0][0]

    return float(score)