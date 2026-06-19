import requests
import pandas as pd

def fetch_salon_master_data():
    print("Connecting to OpenWeb Ninja API with confirmed key architecture...")
    
    url = "https://local-business-data.p.rapidapi.com/search"
    
    querystring = {
        "query": "Bridal Boutiques in Delhi, India",
        "limit": "20",
        "language": "en"
    }
    
    headers = {
        "X-RapidAPI-Key": "34a35f654amshdeada81a3106ab9p1450c6jsnad83bb2b627a",
        "X-RapidAPI-Host": "local-business-data.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status() 
        
        data = response.json()
        businesses = data.get("data", [])
        
        print(f"Successfully received data records! Processing {len(businesses)} businesses...")
        
        salons_data = []
        for biz in businesses:
            # 1. Safely extract nested photo from photos_sample list
            photos_list = biz.get("photos_sample", [])
            photo_url = "No photo available"
            if photos_list and isinstance(photos_list, list):
                photo_url = photos_list[0].get("photo_url", "No photo available")
            
            # 2. Extract operational types/tags to classify the shop
            subtypes = biz.get("subtypes", [])
            categories_text = ", ".join(subtypes) if subtypes else biz.get("type", "Bridal Shop")

            salons_data.append({
                "Salon Name": biz.get("name"),
                "Rating": biz.get("rating", "N/A"),
                "Review Count": biz.get("review_count", 0),
                "Address": biz.get("full_address") or biz.get("address", "N/A"),
                "Phone": biz.get("phone_number", "N/A"),
                "Website": biz.get("website", "N/A"),
                "Photo URL": photo_url,
                "Shop Categories": categories_text,
                "Business Status": biz.get("business_status", "OPEN")
            })
            
        if salons_data:
            df = pd.DataFrame(salons_data)
            df.to_csv("delhi_bridal_salons.csv", index=False, encoding='utf-8')
            print("\n🎉 SUCCESS! 'delhi_bridal_salons.csv' is fully populated and saved!")
        else:
            print("\n❌ Dataset array block was empty.")
            
    except Exception as e:
        print(f"\n❌ API Connection Error: {e}")

if __name__ == "__main__":
    fetch_salon_master_data()