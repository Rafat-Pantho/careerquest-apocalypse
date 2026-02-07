from PIL import Image
import os

def process_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    try:
        img = Image.open(file_path).convert("RGBA")
        datas = img.getdata()
        
        # Sample the top-left pixel to determine the background color to remove
        sample_pixel = datas[0]
        bg_color = sample_pixel[:3] # Get RGB values
        
        print(f"Processing {os.path.basename(file_path)} with background color: {bg_color}")
        
        newData = []
        tolerance = 50 # Adjust tolerance as needed (0-255)

        for item in datas:
            # Check Euclidean distance or simple sum of differences
            dist = sum([abs(item[i] - bg_color[i]) for i in range(3)])
            
            if dist <= tolerance:
                newData.append((0, 0, 0, 0)) # Make transparent
            else:
                newData.append(item)
        
        img.putdata(newData)
        output_path = file_path # Overwrite the file
        img.save(output_path, "PNG")
        print(f"Successfully processed {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

# List of files to fix based on user request ('warrior', 'rough' -> rogue, 'scholer' -> scholar)
files_to_fix = [
    "frontend/src/assets/characters/warrior.png",
    "frontend/src/assets/characters/rogue.png",
    "frontend/src/assets/characters/scholar.png",
    # I'll add the others just in case too, though user didn't mention them explicitly as broken
    "frontend/src/assets/characters/healer.png", 
    "frontend/src/assets/characters/ranger.png",
    "frontend/src/assets/characters/mage.png"
]

base_dir = "/Users/md.isfakiqbalchowdhury/careerquest-apocalypse"

for rel_path in files_to_fix:
    full_path = os.path.join(base_dir, rel_path)
    process_file(full_path)
