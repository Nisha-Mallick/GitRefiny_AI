"""Test script to verify tech stack icons are generated correctly."""
import sys
sys.path.append('backend')

from generator import READMEGenerator
from models import AnalysisResult, RepoMetadata, FileTreeSummary
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("\n" + "="*60)
print("TECH STACK ICONS TEST")
print("="*60 + "\n")

# Create a mock analysis result
repo_meta = RepoMetadata(
    name="test-repo",
    owner="testuser",
    description="A test repository with multiple technologies",
    stars=100,
    forks=20,
    default_branch="main",
    url="https://github.com/testuser/test-repo"
)

file_tree = FileTreeSummary(
    total_files=50,
    total_dirs=10,
    max_depth=5,
    top_level_structure=[
        "src/",
        "tests/",
        "package.json",
        "requirements.txt",
        "README.md"
    ]
)

analysis = AnalysisResult(
    repo_meta=repo_meta,
    languages={"JavaScript": 45.5, "Python": 30.2, "HTML": 15.3, "CSS": 9.0},
    detected_stack=["React", "Node.js", "Flask", "PostgreSQL", "Docker"],
    package_manifests=["package.json", "requirements.txt"],
    file_tree_summary=file_tree,
    hints=["Install Node.js dependencies", "Install Python dependencies"]
)

# Initialize generator
generator = READMEGenerator()

print("1. Testing with Llama 3 (Groq)...")
print("   Detected stack:", analysis.detected_stack)
print("   Generating README with official tech icons...\n")

try:
    # Generate README using Llama 3
    markdown = generator.generate_readme(
        analysis=analysis,
        tone='professional',
        model='Llama 3'
    )
    
    print("✓ README generated successfully!")
    print(f"   Length: {len(markdown)} characters\n")
    
    # Check if it contains shields.io badges
    if 'shields.io' in markdown or 'img.shields.io' in markdown:
        print("✓ Contains shields.io badges (official icons)!")
        
        # Count how many badges
        badge_count = markdown.count('img.shields.io')
        print(f"   Found {badge_count} technology badges\n")
        
        # Extract and show tech stack section
        if '## ' in markdown and 'Tech Stack' in markdown:
            lines = markdown.split('\n')
            in_tech_section = False
            tech_section = []
            
            for line in lines:
                if 'Tech Stack' in line or 'tech stack' in line.lower():
                    in_tech_section = True
                elif in_tech_section and line.startswith('## '):
                    break
                elif in_tech_section:
                    tech_section.append(line)
            
            if tech_section:
                print("Tech Stack Section Preview:")
                print("-" * 60)
                for line in tech_section[:15]:  # Show first 15 lines
                    print(line)
                if len(tech_section) > 15:
                    print("...")
                print("-" * 60)
    else:
        print("⚠ No shields.io badges found - may be using emojis instead")
        
        # Show a sample of the tech stack section
        if 'Tech Stack' in markdown:
            start = markdown.find('Tech Stack')
            sample = markdown[start:start+500]
            print("\nSample of Tech Stack section:")
            print("-" * 60)
            print(sample)
            print("-" * 60)
    
    # Save to file for inspection
    with open('test_readme_with_icons.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print("\n✓ Full README saved to: test_readme_with_icons.md")
    print("   Open this file to see the official technology icons!\n")
    
except Exception as e:
    print(f"✗ Error: {str(e)}\n")

print("="*60)
print("TEST COMPLETE")
print("="*60 + "\n")
