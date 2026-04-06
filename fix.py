import re

with open('petroleum_analysis.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken replacement (if any)
# This handles the literal newline in the string and replaces it back
bad_str = "print('\n[INFO] Please close the plot window to continue execution...'); plt.show()"
bad_str2 = 'print(\'\n[INFO] Please close the plot window to continue execution...\'); plt.show()'

# Just use regex to find and replace the bad strings
content = re.sub(r"print\('\[INFO\].*?'\); plt\.show\(\)", "plt.show()", content)
content = re.sub(r"print\('\\n\[INFO\].*?'\); plt\.show\(\)", "plt.show()", content)
content = re.sub(r"print\('[\s\S]*?\[INFO\].*?'\); plt\.show\(\)", "plt.show()", content)

# Now, apply the correct replacement
new_replacement = 'print("\\n[INFO] Please close the plot window to continue execution..."); plt.show()'
content = content.replace('plt.show()', new_replacement)

with open('petroleum_analysis.py', 'w', encoding='utf-8') as f:
    f.write(content)
