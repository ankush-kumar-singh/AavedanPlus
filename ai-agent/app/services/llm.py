import os

from langchain_ollama import ChatOllama


llm = ChatOllama(
    model=os.getenv("OLLAMA_MODEL", "qwen3:1.7b"),
    base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"),
    temperature=0.4,
    reasoning=False,
    num_predict=256,
)
