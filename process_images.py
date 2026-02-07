from PIL import Image
import os

def process_sprite_sheet(file_path, output_prefix):
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}")
        return

    img = Image.open(file_path).convert("RGBA")
    datas = img.getdata()
    
    # 1. Remove Background
    bg_color = (0, 0, 0, 255) # Assuming solid black from generation
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
    
    # 2. Slice Sprites
    # Simple algorithm: project to X and Y axes to find gaps
    width, height = img.size
    pixels = img.load()
    
    # Helper to check if a row/col has content
    def has_content(x, y):
        return pixels[x, y][3] > 0

    # Find rows
    rows = []
    in_row = False
    start_y = 0
    for y in range(height):
        row_has_content = any(has_content(x, y) for x in range(width))
        if row_has_content and not in_row:
            in_row = True
            start_y = y
        elif not row_has_content and in_row:
            in_row = False
            rows.append((start_y, y))
    
    # Handle last row if active
    if in_row:
        rows.append((start_y, height))

    sprite_count = 0
    for r_idx, (y1, y2) in enumerate(rows):
        # Within this row strip, find columns
        cols = []
        in_col = False
        start_x = 0
        for x in range(width):
            col_has_content = any(has_content(x, y) for y in range(y1, y2))
            if col_has_content and not in_col:
                in_col = True
                start_x = x
            elif not col_has_content and in_col:
                in_col = False
                cols.append((start_x, x))
        
        if in_col:
            cols.append((start_x, width))
            
        for c_idx, (x1, x2) in enumerate(cols):
            # Crop
            sprite = img.crop((x1, y1, x2, y2))
            # Save
            save_path = f"{output_prefix}_{sprite_count}.png"
            sprite.save(save_path)
            print(f"Saved {save_path}")
            sprite_count += 1

process_sprite_sheet('/Users/md.isfakiqbalchowdhury/.gemini/antigravity/brain/85545c92-5ee8-4e75-b053-68e8143bb475/wizard_poses_spritesheet_1770467147355.png', 'frontend/src/assets/characters/wizard_pose')
process_sprite_sheet('/Users/md.isfakiqbalchowdhury/.gemini/antigravity/brain/85545c92-5ee8-4e75-b053-68e8143bb475/mage_poses_spritesheet_1770467163099.png', 'frontend/src/assets/characters/mage_pose')
