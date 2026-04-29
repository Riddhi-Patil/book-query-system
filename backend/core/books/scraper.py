from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
import time
import os

from .models import Book

def scrape_books():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Use absolute path for the driver
    driver_path = os.path.join(os.getcwd(), "msedgedriver.exe")
    service = Service(driver_path)

    driver = None
    try:
        driver = webdriver.Edge(service=service, options=options)
        driver.get("https://books.toscrape.com/")
        time.sleep(2)

        books = driver.find_elements(By.CLASS_NAME, "product_pod")

        for book in books[:5]:
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

            Book.objects.get_or_create(
                title=title,
                author="Unknown",
                rating=rating,
                description=f"{title} is a book found on Books to Scrape. It has a rating of {rating} stars.",
                url=link
            )
        print(f"Scraped {min(len(books), 5)} books successfully via Selenium.")
    except Exception as e:
        print(f"Selenium Scraping Error: {e}")
        # Fallback to BeautifulSoup if Selenium fails (just in case)
        fallback_scrape()
    finally:
        if driver:
            driver.quit()

def fallback_scrape():
    import requests
    from bs4 import BeautifulSoup
    url = "https://books.toscrape.com/"
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        books = soup.find_all("article", class_="product_pod")
        for book in books[:5]:
            title = book.h3.a["title"]
            relative_link = book.h3.a["href"]
            link = f"https://books.toscrape.com/catalogue/{relative_link.replace('../../../', '')}"
            Book.objects.get_or_create(title=title, defaults={"author": "Unknown", "rating": 4.0, "description": f"{title} is a book.", "url": link})
        print("Fallback Scraping Successful.")
    except Exception as e:
        print(f"Fallback Scraping Error: {e}")