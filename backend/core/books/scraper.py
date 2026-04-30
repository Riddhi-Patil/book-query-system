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

                # Simple rating mapping
                rating_element = book.find_element(By.CLASS_NAME, "star-rating")
                rating_classes = rating_element.get_attribute("class").split()
                rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
                rating = 4.0
                for r_word, r_val in rating_map.items():
                    if r_word in rating_classes:
                        rating = float(r_val)
                        break

                obj, created = Book.objects.get_or_create(
                    url=link,
                    defaults={
                        "title": title,
                        "author": "Unknown",
                        "rating": rating,
                        "description": f"{title} is a book found on Books to Scrape. It has a rating of {rating} stars.",
                    }
                )
                if created:
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
                
                obj, created = Book.objects.get_or_create(
                    url=link, 
                    defaults={
                        "title": title,
                        "author": "Unknown", 
                        "rating": 4.0, 
                        "description": f"{title} is a book.", 
                    }
                )
                if created:
                    scraped_count += 1
        print(f"Fallback Scraping Successful: {scraped_count} new books.")
    except Exception as e:
        print(f"Fallback Scraping Error: {e}")