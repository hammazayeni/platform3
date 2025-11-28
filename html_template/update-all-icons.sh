#!/bin/bash
# Script to add icon library references to all HTML files

echo "Adding animated icons CSS and library to all HTML files..."

for file in *.html; do
    # Skip if it's the icons-library.html or landing-enhanced.html
    if [[ "$file" == "icons-library.html" || "$file" == "landing-enhanced.html" ]]; then
        continue
    fi
    
    # Check if animated-icons.css is already included
    if ! grep -q "animated-icons.css" "$file"; then
        # Add CSS link after style.css
        sed -i 's|<link rel="stylesheet" href="./style.css">|<link rel="stylesheet" href="./style.css">\n    <link rel="stylesheet" href="./animated-icons.css">|' "$file"
        echo "Added animated-icons.css to $file"
    fi
    
    # Add icon-replacer.js before closing body tag if not present
    if ! grep -q "icon-replacer.js" "$file"; then
        sed -i 's|</body>|    <script src="./icon-replacer.js"></script>\n</body>|' "$file"
        echo "Added icon-replacer.js to $file"
    fi
done

echo "Icon library integration complete!"
