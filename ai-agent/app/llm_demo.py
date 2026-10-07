from app.services.llm import llm


print("=" * 60)
print("AAVEDAN+ - LOCAL LLM TEST")
print("=" * 60)

prompt = """
You are Aavedan+, an AI government service assistant.

A citizen says:
"I want to apply for an income certificate."

Identify:
1. The requested government service
2. What the agent should do next
3. Ask the citizen for any missing information

Keep the answer concise.
"""

print("\nSending request to local Qwen3 LLM...\n")

response = llm.invoke(prompt)

print("LLM RESPONSE:")
print("-" * 60)
print(response.content)

print("\n" + "=" * 60)
print("LLM TEST SUCCESS")
print("=" * 60)