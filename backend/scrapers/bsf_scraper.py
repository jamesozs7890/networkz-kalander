import requests
from bs4 import BeautifulSoup
import pandas as pd
import re

# Base URL of the website
BASE_URL = "https://www.bsf-richtsberg.de"
URL = BASE_URL + "/veranstaltungen/index.php"

print("Downloading main page...")

# Download the webpage
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

events = []
current_date = None

print("Parsing events...")

# Loop through relevant HTML elements
for el in soup.find_all(["h2", "h3", "p"]):
    text = el.get_text(strip=True)

    # If element is a date (h2), store it
    if el.name == "h2":
        current_date = text

    # If element is an event title (h3)
    elif el.name == "h3":
        title = text

        # Extract event link
        link_tag = el.find("a")
        url = link_tag["href"] if link_tag else ""

        # Convert relative URL to full URL
        if url.startswith("/"):
            url = BASE_URL + url

        # Extract time 
        time_parts = []

        # Look at elements AFTER the title
        next_el = el.find_next_sibling()

        while next_el and next_el.name != "h2":
            if next_el.name == "p":
                t = next_el.get_text(strip=True)

                # Keep lines that contain time-related text
                if "Uhr" in t or "bis" in t:
                    time_parts.append(t)

            next_el = next_el.find_next_sibling()

        # Combine collected time parts into one string
        time_text = " ".join(time_parts)

        # Store event data
        events.append({
            "Date": current_date,
            "Title": title,
            "Time": time_text,
            "URL": url
        })

print(f"Found {len(events)} events")

# Convert to DataFrame and save as CSV
df = pd.DataFrame(events)
df.to_csv("bsf_events.csv", index=False)

print("Saved to bsf_events.csv")