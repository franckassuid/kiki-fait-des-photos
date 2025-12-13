import os
import json
import base64
import requests
from PIL import Image
from PIL.ExifTags import TAGS

# Load .env manually
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

# Configuration
PHOTOS_DIR = 'public/Photos'
OPTIMIZED_DIR = 'public/photos_optimized'
OUTPUT_FILE = 'src/data/galleries.js'
HERO_FILE = 'src/data/hero_images.json'
DESCRIPTIONS_FILE = 'src/data/descriptions.json'

# OpenAI Configuration
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# Image Sizes configuration
SIZES = {
    'thumbnail': {'width': 400, 'suffix': '_thumb'},
    'medium': {'width': 800, 'suffix': '_medium'},
    'large': {'width': 1920, 'suffix': '_large'}
}
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

# City Coordinates Mapping
CITY_COORDINATES = {
    # Argentine
    "Chutes d'Iguazu": [-25.695272, -54.436666],
    "Patagonie": [-50.338, -72.2648],
    "Ushuaïa": [-54.8019, -68.3030],
    
    # Chili
    "Atacama": [-23.8634, -69.1328],
    "Santiago": [-33.4489, -70.6693],
    
    # Japon
    "Fukuoka": [33.5902, 130.4017],
    "Hiroshima": [34.3853, 132.4553],
    "Kobe": [34.6901, 135.1955],
    "Kyoto": [35.0116, 135.7681],
    "Nico": [36.7199, 139.6982], # Nikko
    "Osaka": [34.6937, 135.5023],
    "Tokyo": [35.6762, 139.6503],

    # France
    "Paris": [48.8566, 2.3522],
    "Lyon": [45.7640, 4.8357],
    "Marseille": [43.2965, 5.3698],
    "Bordeaux": [44.8378, -0.5792],
    "Nice": [43.7102, 7.2620],
    "Chateaux de la Loire": [47.3833, 0.6833],
    
    # Italie
    "Rome": [41.9028, 12.4964],
    "Venise": [45.4408, 12.3155],
    "Florence": [43.7696, 11.2558],
    "Milan": [45.4642, 9.1900],
    
    # Perou
    "Cusco": [-13.5319, -71.9675],
    "Lima": [-12.0464, -77.0428],
    "Machu Picchu": [-13.1631, -72.5450],
    
    # Bolivie
    "La Paz": [-16.5000, -68.1500],
    "Uyuni": [-20.4603, -66.8261],
    "Sucre": [-19.0196, -65.2620],
    
    # Bresil
    "Rio de Janeiro": [-22.9068, -43.1729],
    "Sao Paulo": [-23.5505, -46.6333],
    "Salvador": [-12.9777, -38.5016],
    
    # Equateur
    "Quito": [-0.1807, -78.4678],
    "Galapagos": [-0.9538, -90.9656],
    "Cuenca": [-2.9001, -79.0059],
    
    # Philippines
    "El Nido": [11.1656, 119.3929],
    "Coron": [11.9986, 120.2043],
    "Cebu": [10.3157, 123.8854],
    "Siargao": [9.8596, 126.0460],
    
    # Tanzanie
    "Zanzibar": [-6.1659, 39.2026],
    "Serengeti": [-2.3333, 34.8333],
    "Kilimanjaro": [-3.0674, 37.3556],
    
    # Pologne
    "Cracovie": [50.0647, 19.9450],
    "Varsovie": [52.2297, 21.0122],
    
    # Republique Dominicaine
    "Punta Cana": [18.5601, -68.3725],
    "Santo Domingo": [18.4861, -69.9312],
    "Samana": [19.2056, -69.3369],
    
    # Uruguay
    "Montevideo": [-34.9011, -56.1645],
    "Punta del Este": [-34.9631, -54.9290],
}

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        # Resize if huge to save tokens/upload time? OpenAI handles up to 20MB.
        # But we can just send the optimized medium version!
        return base64.b64encode(image_file.read()).decode('utf-8')

def generate_description_ai(image_path, context=""):
    if not OPENAI_API_KEY:
        return None, "no_api_key"

    try:
        base64_image = encode_image(image_path)
        
        headers = {
          "Content-Type": "application/json",
          "Authorization": f"Bearer {OPENAI_API_KEY}"
        }

        payload = {
          "model": "gpt-4o-mini", # Use mini for speed/cost
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": f"Identifie le lieu, l'animal ou le bâtiment principal sur cette photo prise à {context}. Réponds uniquement par le nom précis (ex: 'Lion dans la savane', 'Temple du Kinkaku-ji', 'Vue sur le mont Fuji'). Pas de phrase, pas de ponctuation finale."
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}"
                  }
                }
              ]
            }
          ],
          "max_tokens": 100
        }

        response = requests.post(OPENAI_API_URL, headers=headers, json=payload)
        response_json = response.json()
        
        if 'error' in response_json:
            error_code = response_json['error'].get('code', 'unknown_error')
            return None, error_code

        if 'choices' in response_json and len(response_json['choices']) > 0:
            return response_json['choices'][0]['message']['content'].strip(), None
        else:
            return None, "no_choices"

    except Exception as e:
        print(f"Error generating description: {e}")
        return None, str(e)

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

def process_single_image(source_path, dest_dir_base, file_name_no_ext):
    """
    Generates all required sizes for a single image.
    Returns a dictionary of paths relative to public/
    """
    results = {}
    
    try:
        with Image.open(source_path) as img:
            # Fix orientation based on EXIF
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
            
            # Save original optimized (or fallback to large)
            # Actually, we should probably just have specific sizes to avoid confusion
            # Let's verify if we need a 'master' webp or just the sizes
            
            for size_name, size_config in SIZES.items():
                target_width = size_config['width']
                suffix = size_config['suffix']
                
                # If image is smaller than target, just use original size but optimize
                # But to keep consistent naming, we always use the suffix
                
                new_width = min(img.width, target_width)
                ratio = new_width / img.width
                new_height = int(img.height * ratio)
                
                if ratio < 1:
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                else:
                    resized_img = img.copy()
                
                # Construct filename
                optimized_filename = f"{file_name_no_ext}{suffix}.webp"
                
                # Construct full path
                # dest_dir_base is like 'public/photos_optimized/france/Paris'
                os.makedirs(dest_dir_base, exist_ok=True)
                dest_path = os.path.join(dest_dir_base, optimized_filename)
                
                # Check if exists and fresher
                should_save = True
                if os.path.exists(dest_path):
                    if os.path.getmtime(dest_path) > os.path.getmtime(source_path):
                        should_save = False
                
                if should_save:
                    resized_img.save(dest_path, 'WEBP', quality=QUALITY)
                
                # Store web path
                rel_path = os.path.relpath(dest_path, 'public')
                results[size_name] = '/' + rel_path
                
        return results
            
    except Exception as e:
        print(f"Error processing {source_path}: {e}")
        return None

def get_hero_images():
    try:
        if os.path.exists(HERO_FILE):
            with open(HERO_FILE, 'r') as f:
                return set(json.load(f))
    except Exception as e:
        print(f"Error reading hero file: {e}")
    return set()

def get_descriptions():
    try:
        if os.path.exists(DESCRIPTIONS_FILE):
            with open(DESCRIPTIONS_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading descriptions file: {e}")
    return {}

def generate_galleries():
    galleries = []
    hero_images = get_hero_images()
    descriptions = get_descriptions()
    skip_ai = False
    
    # Get all items in the photos directory
    try:
        items = os.listdir(PHOTOS_DIR)
    except FileNotFoundError:
        print(f"Error: Directory {PHOTOS_DIR} not found.")
        return

    # Sort items to ensure consistent order
    items.sort()
    print(f"Starting optimization... Sizes: {', '.join(SIZES.keys())}")

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
        cities_map = {} # Map to store city data: name -> {coordinates, cover, images}
        
        # Create optimized folder structure base
        optimized_folder_path = os.path.join(OPTIMIZED_DIR, folder_name)

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
                    
                    file_name_no_ext = os.path.splitext(file)[0]
                    
                    # Process image for all sizes
                    image_variants = process_single_image(full_path, target_dir, file_name_no_ext)
                    
                    if image_variants:
                        # Get EXIF
                        current_exif = None
                        try:
                            with Image.open(full_path) as original_img:
                                current_exif = get_exif_data(original_img)
                        except Exception:
                            pass
                            
                        # Check if this image is a selected hero
                        is_hero = file in hero_images # Check full filename match first
                        
                        # Lookup description (from file only)
                        desc_key = f"{folder_name}/{subcategory}/{file}" if subcategory else f"{folder_name}/{file}"
                        description = descriptions.get(desc_key)

                        # Check if we should try to generate description
                        if not description and OPENAI_API_KEY and not skip_ai:
                            print(f"Generating description for {file}...", end='', flush=True)
                            
                            # Web path is /photos_optimized/...
                            # Local path is public/photos_optimized/...
                            medium_web_path = image_variants['medium']
                            medium_local_path = os.path.join('public', medium_web_path.lstrip('/'))
                            
                            context = f"{subcategory}, {country_name}" if subcategory else country_name
                            
                            ai_desc, error_type = generate_description_ai(medium_local_path, context)
                            
                            if ai_desc:
                                description = ai_desc
                                descriptions[desc_key] = description
                                print(" Done.")
                            else:
                                print(f" Failed ({error_type}).")
                                if error_type in ["insufficient_quota", "rate_limit_exceeded"]:
                                    print(f"Stopping AI generation due to {error_type}.")
                                    skip_ai = True

                        image_data = {
                            'src': image_variants['large'], # Default src is large
                            'srcSet': image_variants,
                            'exif': current_exif,
                            'subcategory': subcategory,
                            'isHero': is_hero,
                            'description': description
                        }
                        
                        images.append(image_data)
                        
                        # Check for cover image
                        if 'cover' in file.lower():
                            cover_image = image_variants['medium'] # Use medium for cover
                        
                        # Collect city data
                        if subcategory:
                            if subcategory not in cities_map:
                                cities_map[subcategory] = {
                                    'name': subcategory,
                                    'coordinates': CITY_COORDINATES.get(subcategory, [0, 0]),
                                    'cover': None,
                                    'images': []
                                }
                            cities_map[subcategory]['images'].append(image_variants['medium'])
                            
                    else:
                        print(f"Failed to optimize {file}")

        if not images:
            print(f"Warning: No images found in {folder_name}")
            continue

        # If no cover found, use the first image (medium)
        if not cover_image:
            cover_image = images[0]['srcSet']['medium']

        # Process cities to find landscape covers
        cities = []
        for city_name, city_data in cities_map.items():
            city_cover = None
            
            # Simple fallback to first image for now since we don't want to open all optimized images to check dim
            # In V1 we checked dimensions, here we assume landscape preference or just take first
            if city_data['images']:
                city_cover = city_data['images'][0]
            
            cities.append({
                'name': city_name,
                'coordinates': city_data['coordinates'],
                'cover': city_cover
            })

        # Add to galleries list
        galleries.append({
            'id': folder_name,
            'country': country_name,
            'continent': continent,
            'coordinates': coordinates,
            'code': country_code,
            'cover': cover_image,
            'cities': cities,
            'images': images
        })
        print(f"Processed {country_name}: {len(images)} images.")

    # Save descriptions back to file
    try:
        with open(DESCRIPTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(descriptions, f, indent=2, ensure_ascii=False)
        print(f"Updated descriptions saved to {DESCRIPTIONS_FILE}")
    except Exception as e:
        print(f"Error saving descriptions: {e}")

    # Generate JS content
    js_content = "export const galleries = " + json.dumps(galleries, indent=2, ensure_ascii=False) + ";\n"

    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\nSuccessfully generated {OUTPUT_FILE} with {len(galleries)} galleries.")
    print(f"Optimized images are in {OPTIMIZED_DIR}")

if __name__ == "__main__":
    generate_galleries()
