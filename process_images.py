from PIL import Image
import os

def remove_bg(file_path, output_path):
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        return

    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()
    
    # 1. Remove Background (Solid Black)
    tolerance = 20
    
    newData = []
    for item in datas:
        # Check distance to black
        dist = sum([abs(item[i] - 0) for i in range(3)])
        if dist <= tolerance:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

remove_bg('/Users/md.isfakiqbalchowdhury/.gemini/antigravity/brain/85545c92-5ee8-4e75-b053-68e8143bb475/dark_void_spell_projectile_1770470823414.png', 'frontend/src/assets/effects/dark-spell.png')
