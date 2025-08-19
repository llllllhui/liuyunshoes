import os
import re

# Configuration for each product page
configs = [
    {
        "html_file": "products-new.html",
        "image_folder": "new_product",
        "name_prefix": "new-product",
        "comment_line": "// 可根据需要修改此数组为新品图片列表"
    },
    {
        "html_file": "products-hot.html",
        "image_folder": "hot_product",
        "name_prefix": "hot-product",
        "comment_line": "// 可根据需要修改此数组为爆款图片列表"
    },
    {
        "html_file": "products-classic.html",
        "image_folder": "typical_product",
        "name_prefix": "classic-product",
        "comment_line": "// 可根据需要修改此数组为经典款图片列表"
    }
]
IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif']

def get_image_files(folder):
    """Gets a sorted list of image files from a folder."""
    if not os.path.exists(folder):
        print(f'Warning: Folder {folder} does not exist, skipping.')
        return []
    
    files = [f for f in os.listdir(folder) if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS]
    return sorted(files)

def rename_images_and_get_new_list(image_folder, name_prefix):
    """Renames images in a folder to a clean format and returns the new list of names."""
    old_files = get_image_files(image_folder)
    new_image_list = []
    
    print(f"Processing folder: {image_folder}")
    for i, old_filename in enumerate(old_files):
        ext = os.path.splitext(old_filename)[1]
        new_filename = f"{name_prefix}-{i + 1}{ext}"
        old_filepath = os.path.join(image_folder, old_filename)
        new_filepath = os.path.join(image_folder, new_filename)
        
        if old_filepath != new_filepath:
            os.rename(old_filepath, new_filepath)
            print(f"  Renamed: {old_filename} -> {new_filename}")
        
        new_image_list.append(new_filename)
        
    return new_image_list

def update_html_file(html_file, image_folder, comment_line, new_image_list):
    """Updates the specified HTML file with the new list of images."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'Error: File {html_file} not found, skipping update.')
        return

    # Generate the new JavaScript array content
    new_array_content = ',\n        '.join(f"'{os.path.join(image_folder, img)}'" for img in new_image_list)
    new_code_block = f'{comment_line}\n    const images = [\n        {new_array_content}\n    ];'

    # Use regex to find and replace the code block to handle variations in whitespace
    # This looks for the comment line, followed by 'const images = [', and replaces everything until '];'
    pattern = re.compile(f"({re.escape(comment_line)}\s*const\s+images\s*=\s*\[).*?(\];)", re.DOTALL)
    
    if not pattern.search(content):
        print(f'Warning: Image array code block not found in {html_file}. Please check the comment marker.')
        return

    # To avoid issues with backslashes in file paths on Windows, we replace them with forward slashes for the regex replacement
    replacement_string = new_code_block.replace('\\', '/')
    
    updated_content = pattern.sub(replacement_string, content)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print(f'Successfully updated {html_file} with {len(new_image_list)} images.\n')

if __name__ == '__main__':
    for config in configs:
        new_images = rename_images_and_get_new_list(config["image_folder"], config["name_prefix"])
        if new_images:
            update_html_file(config["html_file"], config["image_folder"], config["comment_line"], new_images)
    print('All pages and images processed.')