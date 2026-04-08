import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match <!-- [SME_MANDATE] --> 
    # followed by an optional block comment <!-- ... -->
    pattern = r'<!-- \[SME_MANDATE\] -->\s*(?:<!--[\s\S]*?-->)?\s*'
    
    new_content = re.sub(pattern, '', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    content_dir = 'src/content'
    cleaned_count = 0
    for root, dirs, files in os.walk(content_dir):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                if clean_file(filepath):
                    print(f'Cleaned: {filepath}')
                    cleaned_count += 1
    
    print(f'Total files cleaned: {cleaned_count}')

if __name__ == '__main__':
    main()
