import os
import zipfile
import sys

def make_archive(root_dir, output_zip_path):
    # Ensure parent dir exists
    os.makedirs(os.path.dirname(os.path.abspath(output_zip_path)), exist_ok=True)
    
    # Excluded directories and patterns
    exclude_dirs = {'node_modules', '.git', '.aistudio', 'dist', '__pycache__', '.cache'}
    exclude_exts = {'.zip', '.log', '.tmp'}
    
    file_count = 0
    total_uncompressed_bytes = 0
    
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune excluded directories in-place
            dirnames[:] = [d for d in dirnames if d not in exclude_dirs and not d.startswith('.git')]
            
            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                if ext in exclude_exts:
                    continue
                if filename.startswith('.DS_Store'):
                    continue
                    
                full_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(full_path, root_dir)
                
                # Double check no node_modules or zip leaked
                if 'node_modules' in rel_path or 'dist' in rel_path.split(os.sep):
                    continue
                    
                zipf.write(full_path, arcname=rel_path)
                file_count += 1
                total_uncompressed_bytes += os.path.getsize(full_path)
                
    zip_size = os.path.getsize(output_zip_path)
    print(f"Created ZIP: {output_zip_path}")
    print(f"Files included: {file_count}")
    print(f"Uncompressed: {total_uncompressed_bytes / 1024:.1f} KB")
    print(f"Archive Size: {zip_size / 1024:.1f} KB")

if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    output = sys.argv[2] if len(sys.argv) > 2 else 'dukanniq-retail-ai-platform.zip'
    make_archive(root, output)
