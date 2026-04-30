from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
import time
import os

from .models import Book

def scrape_books(max_pages=5):
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Use absolute path for the driver
    driver_path = os.path.join(os.getcwd(), "msedgedriver.exe")
    service = Service(driver_path)

    driver = None
    scraped_count = 0
    try:
        driver = webdriver.Edge(service=service, options=options)
        
        for page in range(1, max_pages + 1):
            url = f"https://books.toscrape.com/catalogue/page-{page}.html"
            print(f"Scraping page {page}: {url}")
            driver.get(url)
            time.sleep(1)

            books = driver.find_elements(By.CLASS_NAME, "product_pod")
            if not books:
                break

            for book in books:
                title_element = book.find_element(By.TAG_NAME, "h3").find_element(By.TAG_NAME, "a")
                title = title_element.get_attribute("title")
                link = title_element.get_attribute("href")
                
                # We need to visit the detail page to get the high-res image
                # and actual description if we want better data.
                # However, visiting every page is slow. Let's optimize by
                # constructing the high-res image URL if possible.
                # Thumbnail: .../media/cache/23/0d/230d1451a2333907b532742a7a71f076.jpg
                # High-res:  .../media/cache/fe/72/fe72f0532301ec28892ae79a629a293c.jpg
                # It seems we MUST visit the detail page to get the correct cache ID for the high-res image.
                
                # Open detail page in new tab or same tab
                current_window = driver.current_window_handle
                driver.execute_script(f"window.open('{link}', '_blank');")
                driver.switch_to.window(driver.window_handles[-1])
                time.sleep(0.5)
                
                try:
                    # Get high-res image
                    img_element = driver.find_element(By.CSS_SELECTOR, ".item.active img")
                    img_url = img_element.get_attribute("src")
                    
                    # Get actual description
                    try:
                        description = driver.find_element(By.XPATH, "//div[@id='product_description']/following-sibling::p").text
                    except:
                        description = f"{title} is a book found on Books to Scrape."
                finally:
                    driver.close()
                    driver.switch_to.window(current_window)

                # Simple rating mapping
                rating_element = book.find_element(By.CLASS_NAME, "star-rating")
                rating_classes = rating_element.get_attribute("class").split()
                rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
                rating = 4.0
                for r_word, r_val in rating_map.items():
                    if r_word in rating_classes:
                        rating = float(r_val)
                        break

                # AUTHOR FIX: BooksToScrape doesn't have authors on the main page.
                # We will use the AI to "invent" a realistic author or extract it from the description
                # For now, let's set a distinct placeholder so we know it's working
                author = "Author Pending"

                obj, created = Book.objects.get_or_create(
                    title=title,
                    defaults={
                        "author": author,
                        "rating": rating,
                        "description": description,
                        "image_url": img_url,
                        "url": link
                    }
                )
                if not created:
                    # Update image URL and description for existing books if they are likely thumbnails
                    if not obj.image_url or "media/cache" in obj.image_url:
                        obj.image_url = img_url
                        obj.description = description
                        obj.save()
                else:
                    scraped_count += 1
            
        print(f"Scraped {scraped_count} new books successfully via Selenium.")
    except Exception as e:
        print(f"Selenium Scraping Error: {e}")
        # Fallback to BeautifulSoup if Selenium fails
        fallback_scrape(max_pages)
    finally:
        if driver:
            driver.quit()

def fallback_scrape(max_pages=5):
    import requests
    from bs4 import BeautifulSoup
    scraped_count = 0
    try:
        for page in range(1, max_pages + 1):
            url = f"https://books.toscrape.com/catalogue/page-{page}.html"
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                break
                
            soup = BeautifulSoup(response.text, 'html.parser')
            books = soup.find_all("article", class_="product_pod")
            for book in books:
                title = book.h3.a["title"]
                relative_link = book.h3.a["href"]
                link = f"https://books.toscrape.com/catalogue/{relative_link}"
                
                # Image fallback - constructing the detail page URL and then the image URL
                # The image URL on the detail page is predictable:
                # Thumbnail: ../../media/cache/2c/da/2cdad67c44b002e7ead0cc35693c0e8b.jpg
                # It's usually the same file just referenced differently.
                # Let's try to get a better one if possible or just use the absolute path.
                relative_img = book.find("img")["src"]
                img_url = relative_img.replace("../..", "https://books.toscrape.com")
                
                obj, created = Book.objects.get_or_create(
                    title=title, 
                    defaults={
                        "url": link,
                        "author": "Unknown", 
                        "rating": 4.0, 
                        "description": f"{title} is a book.", 
                        "image_url": img_url
                    }
                )
                if not created:
                    if not obj.image_url or "media/cache" in obj.image_url:
                        obj.image_url = img_url
                        obj.save()
                else:
                    scraped_count += 1
        print(f"Fallback Scraping Successful: {scraped_count} new books.")
    except Exception as e:
        print(f"Fallback Scraping Error: {e}")