"""Test script to verify Mermaid diagrams are generated in README."""
import sys
sys.path.append('backend')

from generator import READMEGenerator
from models import AnalysisResult, RepoMetadata, FileTreeSummary
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

print("\n" + "="*60)
print("MERMAID DIAGRAM GENERATION TEST")
print("="*60 + "\n")

# Create a mock analysis result for a full-stack app
repo_meta = RepoMetadata(
    name="fullstack-app",
    owner="testuser",
    description="A full-stack web application with React frontend and Node.js backend",
    stars=250,
    forks=45,
    default_branch="main",
    url="https://github.com/testuser/fullstack-app"
)

file_tree = FileTreeSummary(
    total_files=120,
    total_dirs=25,
    max_depth=6,
    top_level_structure=[
        "frontend/",
        "backend/",
        "database/",
        "docker-compose.yml",
        "README.md"
    ]
)

analysis = AnalysisResult(
    repo_meta=repo_meta,
    languages={"JavaScript": 40.0, "TypeScript": 25.0, "Python": 20.0, "HTML": 10.0, "CSS": 5.0},
    detected_stack=["React", "Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
    package_manifests=["package.json", "requirements.txt", "docker-compose.yml"],
    file_tree_summary=file_tree,
    hints=["Install Node.js dependencies", "Set up PostgreSQL database", "Configure Redis"]
)

# Initialize generator
generator = READMEGenerator()

print("1. Testing Mermaid diagram generation...")
print("   Detected stack:", analysis.detected_stack)
print("   Generating README with architecture diagram...\n")

try:
    # Generate README using Llama 3
    markdown = generator.generate_readme(
        analysis=analysis,
        tone='professional',
        model='Llama 3'
    )
    
    print("✓ README generated successfully!")
    print(f"   Length: {len(markdown)} characters\n")
    
    # Check for Mermaid diagrams
    mermaid_pattern = r'```mermaid\n(.*?)\n```'
    mermaid_matches = re.findall(mermaid_pattern, markdown, re.DOTALL)
    
    if mermaid_matches:
        print(f"✓ Found {len(mermaid_matches)} Mermaid diagram(s)!\n")
        
        for i, diagram in enumerate(mermaid_matches, 1):
            print(f"Diagram {i}:")
            print("-" * 60)
            print(diagram[:300])  # Show first 300 chars
            if len(diagram) > 300:
                print("...")
            print("-" * 60)
            print()
            
            # Check diagram type
            if 'graph' in diagram.lower():
                print(f"   Type: Graph/Flowchart ✓")
            elif 'sequencediagram' in diagram.lower():
                print(f"   Type: Sequence Diagram ✓")
            elif 'flowchart' in diagram.lower():
                print(f"   Type: Flowchart ✓")
            
            # Check for components
            components = []
            if 'client' in diagram.lower() or 'browser' in diagram.lower():
                components.append("Client/Browser")
            if 'frontend' in diagram.lower() or 'react' in diagram.lower():
                components.append("Frontend")
            if 'backend' in diagram.lower() or 'api' in diagram.lower() or 'server' in diagram.lower():
                components.append("Backend/API")
            if 'database' in diagram.lower() or 'db' in diagram.lower():
                components.append("Database")
            
            if components:
                print(f"   Components: {', '.join(components)} ✓")
            print()
    else:
        print("⚠ No Mermaid diagrams found!")
        
        # Check if there's an Architecture section
        if 'architecture' in markdown.lower():
            arch_start = markdown.lower().find('architecture')
            sample = markdown[arch_start:arch_start+500]
            print("\nArchitecture section sample:")
            print("-" * 60)
            print(sample)
            print("-" * 60)
    
    # Save to file
    with open('test_readme_with_diagram.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print("\n✓ Full README saved to: test_readme_with_diagram.md")
    print("   Open this file in GitHub or a Mermaid viewer to see the diagram!\n")
    
    # Summary
    print("="*60)
    print("SUMMARY")
    print("="*60)
    if mermaid_matches:
        print(f"✓ {len(mermaid_matches)} Mermaid diagram(s) generated")
        print("✓ Diagrams will render on GitHub automatically")
        print("✓ Architecture visualization included")
    else:
        print("⚠ No Mermaid diagrams found - may need to adjust prompt")
    print()
    
except Exception as e:
    print(f"✗ Error: {str(e)}\n")
    import traceback
    traceback.print_exc()

print("="*60)
print("TEST COMPLETE")
print("="*60 + "\n")
