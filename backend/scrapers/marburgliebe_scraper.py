from seleniumbase import BaseCase
import pandas as pd
import re

class EventScraper(BaseCase):

    def test_scrape_events(self):
        # 1. Open the website
        self.open("https://www.marburg-liebe.de/veranstaltungskalender.html#/veranstaltungen")
        self.sleep(3)

        # 2. Dismiss consent banner
        try:
            self.click('button:contains("Einwilligung erteilen")')
        except:
            try:
                self.click('//*[contains(text(), "Einwilligung erteilen")]', by="xpath")
            except:
                print("No consent banner found, continuing...")
        self.sleep(2)

        # 3. Click Filter button to open the filter panel
        self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            const host = document.querySelector('dw-app-container');
            const buttons = queryShadowAll('button', host.shadowRoot);
            const filterBtn = buttons.find(b => b.textContent.trim() === 'Filter');
            if (filterBtn) filterBtn.click();
        """)
        self.sleep(2)

        # 4. Deep scan for 'mehr'/'zeigen'/checkboxes/labels
        deep_scan = self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            
            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return [];
            
            const all = queryShadowAll('*', host.shadowRoot);
            
            const interesting = all.filter(el => {
                const text = el.textContent.trim().toLowerCase();
                const tag = el.tagName.toLowerCase();
                return (
                    text.includes('mehr') ||
                    text.includes('zeigen') ||
                    tag === 'input' ||
                    tag === 'label' ||
                    tag === 'checkbox' ||
                    el.className.toString().includes('filter') ||
                    el.className.toString().includes('category') ||
                    el.className.toString().includes('checkbox')
                );
            });
            
            return interesting.map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().substring(0, 80),
                class: el.className.toString().substring(0, 80),
                type: el.getAttribute('type') || '',
                id: el.id || ''
            }));
        """)

        # Specifically hunt for 'mehr zeigen' text anywhere
        mehr_scan = self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            
            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return [];
            
            const all = queryShadowAll('*', host.shadowRoot);
            
            // Only direct text match on the element itself, not inherited children
            return all
                .filter(el => {
                    const direct = Array.from(el.childNodes)
                        .filter(n => n.nodeType === 3)
                        .map(n => n.textContent.trim())
                        .join(' ')
                        .toLowerCase();
                    return direct.includes('mehr') || direct.includes('zeigen');
                })
                .map(el => ({
                    tag: el.tagName,
                    text: el.textContent.trim().substring(0, 80),
                    class: el.className.toString().substring(0, 80),
                    visible: el.offsetParent !== null
                }));
        """)

        print(f"\n--- 'mehr/zeigen' elements ({len(mehr_scan)} found) ---")
        for i, el in enumerate(mehr_scan):
            print(f"{i}: <{el['tag']}> visible={el['visible']} class='{el['class']}' | text='{el['text']}'")

        print(f"\n--- Interesting elements ({len(deep_scan)} found) ---")
        for i, el in enumerate(deep_scan):
            if i > 100:
                break
            print(f"{i}: <{el['tag']}> type='{el['type']}' id='{el['id']}' class='{el['class']}' | text='{el['text']}'")
        

        # Click ALL 'mehr zeigen' links to expand all category sections
        mehr_count = self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            
            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return 0;
            
            const links = queryShadowAll('a.toggle-expand-box', host.shadowRoot);
            links.forEach(l => l.click());
            return links.length;
        """)

        print(f"Clicked {mehr_count} 'Mehr zeigen' links")
        self.sleep(3)

        # Now dump all labels and checkboxes
        filters_scan = self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            
            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return [];
            
            const labels = queryShadowAll('label', host.shadowRoot);
            return labels.map(l => ({
                text: l.textContent.trim(),
                for: l.getAttribute('for') || '',
                class: l.className.toString()
            }));
        """)

        print(f"\n--- Labels/Filters ({len(filters_scan)} found) ---")
        for i, f in enumerate(filters_scan):
            print(f"{i}: text='{f['text']}' | for='{f['for']}' | class='{f['class']}'")

        self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }
            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return 0;
            const links = queryShadowAll('a.toggle-expand-box', host.shadowRoot);
            links.forEach(l => l.click());
            return links.length;
        """)
        self.sleep(3)

        # Define which filters you want to select (exact label text)
        filters_to_select = [
            "Gesundheit",
            "Gesundheit/Wellness",
            "Kultur",
            "Land erleben",
            "Natur / Geologie",
            "Schlechtwetter Tipp",
            "Wellness",
            # Add more as needed
        ]

        for filter_name in filters_to_select:
            # Call 1: Open panel + expand mehr zeigen
            self.execute_script("""
                function queryShadowAll(selector, root) {
                    let results = [];
                    const all = root.querySelectorAll('*');
                    for (const el of all) {
                        if (el.matches(selector)) results.push(el);
                        if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                    }
                    return results;
                }
                const host = document.querySelector('dw-app-container');
                if (!host || !host.shadowRoot) return;

                // Open filter panel
                const buttons = queryShadowAll('button', host.shadowRoot);
                const filterBtn = buttons.find(b => b.textContent.trim() === 'Filter');
                if (filterBtn) filterBtn.click();

                // Expand all 'mehr zeigen'
                const mehrLinks = queryShadowAll('a.toggle-expand-box', host.shadowRoot);
                mehrLinks.forEach(l => l.click());
            """)

            self.sleep(5)  # Wait for DOM to render the newly revealed labels

            # Call 2: Now find and click the checkbox
            result = self.execute_script(f"""
                function queryShadowAll(selector, root) {{
                    let results = [];
                    const all = root.querySelectorAll('*');
                    for (const el of all) {{
                        if (el.matches(selector)) results.push(el);
                        if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                    }}
                    return results;
                }}

                const host = document.querySelector('dw-app-container');
                if (!host || !host.shadowRoot) return 'no host';

                const labels = queryShadowAll('label', host.shadowRoot);
                const label = labels.find(l => l.textContent.trim() === '{filter_name}');
                if (!label) return 'label not found';

                const forId = label.getAttribute('for');
                if (!forId) {{ label.click(); return 'clicked label directly'; }}

                const inputs = queryShadowAll('input#' + forId, host.shadowRoot);
                if (inputs.length === 0) {{ label.click(); return 'clicked label fallback'; }}

                inputs[0].click();
                return 'clicked checkbox: ' + forId;
            """)

            print(f"Filter '{filter_name}': {result}")
            self.sleep(2)  # Wait for page to refresh before next filter

        print("All filters applied!")

        # Wait for events to load after filters applied
        self.sleep(3)

        # Collect all events from shadow DOM
        events_data = self.execute_script("""
            function queryShadowAll(selector, root) {
                let results = [];
                const all = root.querySelectorAll('*');
                for (const el of all) {
                    if (el.matches(selector)) results.push(el);
                    if (el.shadowRoot) results = results.concat(queryShadowAll(selector, el.shadowRoot));
                }
                return results;
            }

            const host = document.querySelector('dw-app-container');
            if (!host || !host.shadowRoot) return [];

            const items = queryShadowAll('dw-event-listitem', host.shadowRoot);
            
            return items.map(item => {
                // Title
                const titleEl = item.shadowRoot 
                    ? item.shadowRoot.querySelector('.offer-card__title, h2, h3, [class*="title"]')
                    : item.querySelector('.offer-card__title, h2, h3, [class*="title"]');

                // Link
                const linkEl = item.shadowRoot
                    ? item.shadowRoot.querySelector('a')
                    : item.querySelector('a');

                // Date
                const dateEl = item.shadowRoot
                    ? item.shadowRoot.querySelector('[class*="date"], [class*="time"]')
                    : item.querySelector('[class*="date"], [class*="time"]');

                // Location
                const locEl = item.shadowRoot
                    ? item.shadowRoot.querySelector('[class*="location"], [class*="place"]')
                    : item.querySelector('[class*="location"], [class*="place"]');

                // Category
                const catEl = item.shadowRoot
                    ? item.shadowRoot.querySelector('[class*="category"]')
                    : item.querySelector('[class*="category"]');

                return {
                    title: titleEl ? titleEl.textContent.trim() : '',
                    url: linkEl ? linkEl.href : '',
                    date: dateEl ? dateEl.textContent.trim() : '',
                    location: locEl ? locEl.textContent.trim() : '',
                    category: catEl ? catEl.textContent.trim() : '',
                    full_text: item.textContent.trim().substring(0, 200)
                };
            });
        """)

        print(f"\nFound {len(events_data)} events")
        for i, e in enumerate(events_data[:5]):  # Preview first 5
            print(f"\nEvent {i+1}:")
            print(f"  Title:    {e['title']}")
            print(f"  URL:      {e['url']}")
            print(f"  Date:     {e['date']}")
            print(f"  Location: {e['location']}")
            print(f"  Category: {e['category']}")
            print(f"  Raw text: {e['full_text']}")

        cleaned_events = []
        for e in events_data:
            raw = e['full_text']
            
            # Date is consistently formatted as "Do., 12 März, 2026 14:00"
            date_match = re.search(r'(Mo|Di|Mi|Do|Fr|Sa|So)\., \d+ \w+, \d{4} \d{2}:\d{2}', raw)
            date = date_match.group(0) if date_match else ''
            
            # Title is the text BEFORE the date
            title = raw[:date_match.start()].strip() if date_match else ''
            
            # Location: clean up "Auf Karte zeigen" suffix
            location = e['location'].replace('Auf Karte zeigen', '').strip()
            if location.endswith('  '):
                location = location.strip()

            cleaned_events.append({
                'Title': title,
                'Date': date,
                'Category': e['category'],
                'Location': location,
                'URL': e['url']
            })

        # Preview
        print(f"\n--- Cleaned Events Preview ---")
        for i, e in enumerate(cleaned_events[:5]):
            print(f"\nEvent {i+1}:")
            for k, v in e.items():
                print(f"  {k}: {v}")

        # Save to CSV
        df = pd.DataFrame(cleaned_events)
        
        output_path = "marburgliebe_events.csv"  # ROUNAK CHANGED IT-Change this to your desired folder
        df.to_csv(output_path, index=False)
        print(f"\nSaved {len(df)} events to {output_path}")

