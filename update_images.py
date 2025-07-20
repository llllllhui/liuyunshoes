import os

# 多页面配置参数（可根据需要添加更多分类）
configs = [
    {
        "html_file": "index.html",
        "image_folder": "picture",
        "comment_line": "// 此数组由脚本自动生成，每次添加/删除图片后请运行update_images.py脚本更新"
    },
    {
        "html_file": "products-new.html",
        "image_folder": "new_product",
        "comment_line": "// 可根据需要修改此数组为新品图片列表"
    },
    {
        "html_file": "products-hot.html",
        "image_folder": "hot_product",
        "comment_line": "// 可根据需要修改此数组为爆款图片列表"
    },
    {
        "html_file": "products-classic.html",
        "image_folder": "typical_product",
        "comment_line": "// 可根据需要修改此数组为经典款图片列表"
    }
]
IMAGE_EXT = '.jpg'

def get_image_list(folder):
    """获取指定文件夹下所有指定扩展名的文件"""
    if not os.path.exists(folder):
        print(f'Warning: Folder {folder} does not exist, skipping update.')
        return []
    return [f for f in os.listdir(folder) if f.endswith(IMAGE_EXT)]

def update_html(config):
    """更新指定HTML文件中的images数组"""
    html_file = config['html_file']
    image_folder = config['image_folder']
    comment_line = config['comment_line']

    # 获取图片列表
    image_list = get_image_list(image_folder)

    # 读取HTML文件
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f'Error: File {html_file} not found, skipping update.')
        return

    # 生成新的images数组内容
    new_array = ',\n    '.join(f"'{img}'" for img in image_list)
    new_code = f'{comment_line}\nconst images = [\n    {new_array}\n];'

    # 定位并替换原有代码块
    start_tag = comment_line
    end_tag = '];'
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag, start_idx) + len(end_tag)

    if start_idx == -1 or end_idx == -1:
        print(f'Warning: Image array code block not found in {html_file}, please check if the comment line is correct.')
        return

    # 写入更新后的内容
    updated_content = content[:start_idx] + new_code + content[end_idx:]
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print(f'Successfully updated {html_file}, found {len(image_list)} images.')

if __name__ == '__main__':
    for config in configs:
        update_html(config)
    print(f'All page image lists updated.')
