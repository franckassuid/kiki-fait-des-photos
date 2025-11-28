import os
import json
from PIL import Image
from PIL.ExifTags import TAGS

# Configuration
PHOTOS_DIR = 'public/Photos'
OPTIMIZED_DIR = 'public/photos_optimized'
OUTPUT_FILE = 'src/data/galleries.js'
MAX_WIDTH = 1920
QUALITY = 80

# Mapping for display names and continents
# Folder Name -> (Country Name, Continent, Coordinates, Country Code)
META_DATA = {
    'argentine': ('Argentine', 'Amérique du Sud', [-38.416097, -63.616672], 'AR'),
    'bolivie': ('Bolivie', 'Amérique du Sud', [-16.290154, -63.588653], 'BO'),
    'bresil': ('Brésil', 'Amérique du Sud', [-14.235004, -51.92528], 'BR'),
    'chili': ('Chili', 'Amérique du Sud', [-35.675147, -71.542969], 'CL'),
    'equateur': ('Équateur', 'Amérique du Sud', [-1.831239, -78.183406], 'EC'),
    'france': ('France', 'Europe', [46.227638, 2.213749], 'FR'),
    'italie': ('Italie', 'Europe', [41.87194, 12.56738], 'IT'),
    'japon': ('Japon', 'Asie', [36.204824, 138.252924], 'JP'),
    'perou': ('Pérou', 'Amérique du Sud', [-9.19, -75.015152], 'PE'),
    'philippines': ('Philippines', 'Asie', [12.879721, 121.774017], 'PH'),
    'pologne': ('Pologne', 'Europe', [51.919438, 19.145136], 'PL'),
    'republique-dominicaine': ('République Dominicaine', 'Caraïbes', [18.735693, -70.162651], 'DO'),
    'tanzanie': ('Tanzanie', 'Afrique', [-6.369028, 34.888822], 'TZ'),
    'uruguay': ('Uruguay', 'Amérique du Sud', [-32.522779, -55.765835], 'UY'),
}

def get_exif_data(image):
    try:
        exif = image._getexif()
        if not exif:
            return None
        
        exif_data = {}
        for tag_id, value in exif.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == 'Make':
                exif_data['make'] = str(value)
            elif tag == 'Model':
                exif_data['model'] = str(value)
            elif tag == 'ISOSpeedRatings':
                exif_data['iso'] = str(value)
            elif tag == 'FNumber':
                exif_data['f_stop'] = f"f/{float(value)}" if value else None
            elif tag == 'ExposureTime':
                exif_data['shutter_speed'] = f"{value}s"
            elif tag == 'FocalLength':
                exif_data['focal_length'] = f"{int(value)}mm"
            elif tag == 'DateTimeOriginal':
                exif_data['date'] = str(value)
                
        return exif_data
    except Exception as e:
        print(f"Error reading EXIF: {e}")
        return None

def optimize_image(source_path, dest_path):
    """
    Resizes and converts image to WebP.
    Returns True if successful, False otherwise.
    """
    try:
        # Check if destination exists and is newer than source
        if os.path.exists(dest_path):
            source_mtime = os.path.getmtime(source_path)
            dest_mtime = os.path.getmtime(dest_path)
            if dest_mtime > source_mtime:
                return True # Already optimized

        with Image.open(source_path) as img:
            # Fix orientation based on EXIF
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)

            # Resize if too large
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)

            # Ensure directory exists
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)

            # Save as WebP
            img.save(dest_path, 'WEBP', quality=QUALITY)
            return True
    except Exception as e:
        print(f"Error optimizing {source_path}: {e}")
        return False

def generate_galleries():
    galleries = []
    
    # Get all items in the photos directory
    try:
        items = os.listdir(PHOTOS_DIR)
    except FileNotFoundError:
        print(f"Error: Directory {PHOTOS_DIR} not found.")
        return

    # Sort items to ensure consistent order
    items.sort()

    print(f"Starting optimization... Target: {MAX_WIDTH}px width, {QUALITY}% quality WebP.")

    for folder_name in items:
        folder_path = os.path.join(PHOTOS_DIR, folder_name)
        
        # Skip if not a directory or if it's the flags folder
        if not os.path.isdir(folder_path) or folder_name == 'flags':
            continue

        # Get metadata
        if folder_name in META_DATA:
            country_name, continent, coordinates, country_code = META_DATA[folder_name]
        else:
            # Fallback for unknown folders
            country_name = folder_name.capitalize()
            continent = 'Autre'
            coordinates = [0, 0]
            country_code = None
            print(f"Warning: No metadata for {folder_name}, using defaults.")

        # Find images
        images = []
        cover_image = None
        
        # Create optimized folder structure
        optimized_folder_path = os.path.join(OPTIMIZED_DIR, folder_name)
        os.makedirs(optimized_folder_path, exist_ok=True)

        # Walk through the folder
        for root, _, files in os.walk(folder_path):
            files.sort() # Sort files for consistent order
            
            # Determine subcategory
            rel_dir = os.path.relpath(root, folder_path)
            if rel_dir == '.':
                subcategory = None
            else:
                subcategory = rel_dir

            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    full_path = os.path.join(root, file)
                    
                    # Determine target directory for optimized image
                    if subcategory:
                        target_dir = os.path.join(optimized_folder_path, subcategory)
                    else:
                        target_dir = optimized_folder_path
                    
                    os.makedirs(target_dir, exist_ok=True)

                    # Define optimized path (change extension to .webp)
                    file_name_no_ext = os.path.splitext(file)[0]
                    optimized_filename = f"{file_name_no_ext}.webp"
                    optimized_full_path = os.path.join(target_dir, optimized_filename)
                    
                    # Optimize the image
                    print(f"Processing {file}...", end='\r')
                    
                    # We need to open the image to get EXIF before optimizing/saving
                    # because optimization might strip it or we want original data
                    current_exif = None
                    try:
                        with Image.open(full_path) as original_img:
                            current_exif = get_exif_data(original_img)
                    except Exception as e:
                        print(f"Error reading original for EXIF {file}: {e}")

                    if optimize_image(full_path, optimized_full_path):
                        # Create the web path (relative to public)
                        # public/photos_optimized/country/subcat/img.webp -> /photos_optimized/country/subcat/img.webp
                        rel_path = os.path.relpath(optimized_full_path, 'public')
                        web_path = '/' + rel_path
                        
                        images.append({
                            'src': web_path,
                            'exif': current_exif,
                            'subcategory': subcategory
                        })
                        
                        # Check for cover image (prefer original name 'cover' even if converted to webp)
                        if 'cover' in file.lower():
                            cover_image = web_path
                    else:
                        print(f"Failed to optimize {file}")

        if not images:
            print(f"Warning: No images found in {folder_name}")
            continue

        # If no cover found, use the first image
        if not cover_image:
            cover_image = images[0]['src']

        # Add to galleries list
        galleries.append({
            'id': folder_name,
            'country': country_name,
            'continent': continent,
            'coordinates': coordinates,
            'code': country_code,
            'cover': cover_image,
            'images': images
        })
        print(f"Processed {country_name}: {len(images)} images.")

    # Generate JS content
    js_content = "export const galleries = " + json.dumps(galleries, indent=2, ensure_ascii=False) + ";\n"

    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\nSuccessfully generated {OUTPUT_FILE} with {len(galleries)} galleries.")
    print(f"Optimized images are in {OPTIMIZED_DIR}")

if __name__ == "__main__":
    generate_galleries()
