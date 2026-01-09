from spellchecker import SpellChecker
import re

# Sample text with intentional errors
test_text = """
This is a test documnt with some speling erors. The proteus software is used for simulation.
AIML and DSP are important topics. Mrs. Sharad gave us guidance. The behaviour of the system is good.
We need to analyse the data carefully. This is a cost-effective solution.
"""

spell = SpellChecker()
words = test_text.split()

# OLD METHOD (shows the problem)
print("=== OLD METHOD (Too many false positives) ===")
old_misspelled = list(spell.unknown(words))
print(f"Found {len(old_misspelled)} errors: {old_misspelled}\n")

# NEW METHOD (improved filtering)
print("=== NEW METHOD (Filtered) ===")
clean_words = []
for word in words:
    cleaned = re.sub(r'[^a-zA-Z]', '', word).lower()
    if len(cleaned) >= 3 and cleaned.isalpha():
        clean_words.append(cleaned)

raw_misspelled = list(spell.unknown(clean_words))

misspelled = []
for word in raw_misspelled:
    if len(word) >= 4:
        skip_words = {'aiml', 'proteus', 'matlab', 'github', 'api', 'json', 'html', 'css', 'dsp', 'mrs', 'sharad'}
        if word.lower() not in skip_words:
            misspelled.append(word)

print(f"Found {len(misspelled)} real errors: {misspelled}")
print("\n✅ These are actual spelling mistakes that should be flagged!")
