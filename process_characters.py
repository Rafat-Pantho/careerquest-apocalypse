from PIL import Image
import os

def remove_bg(file_path, output_path):
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} (Not Found)")
        return

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()
    
    # 1. Remove Background (Solid Black or Dark)
    # The generated images have a black background.
    tolerance = 40 # Increased tolerance slightly
    
    newData = []
    for item in datas:
        # Check distance to black (0,0,0)
        dist = sum([abs(item[i] - 0) for i in range(3)])
        if dist <= tolerance:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Resize for consistency (optional, but good)
    # img = img.resize((128, 128), Image.Resampling.NEAREST)

    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

base_path = "/Users/md.isfakiqbalchowdhury/.gemini/antigravity/brain/85545c92-5ee8-4e75-b053-68e8143bb475/"
dest_path = "frontend/src/assets/characters/"

mappings = [
    ("warrior_sprite_1770478223902.png", "warrior.png"),
    ("rogue_sprite_1770478251361.png", "rogue.png"),
    ("healer_sprite_1770478271779.png", "healer.png"),
    ("scholar_sprite_1770478307388.png", "scholar.png"),
    ("ranger_sprite_1770478323579.png", "ranger.png"),
]

for src, dest in mappings:
    remove_bg(os.path.join(base_path, src), os.path.join(dest_path, dest))
