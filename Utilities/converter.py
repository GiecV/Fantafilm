import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('Utilities/Fantafilm.xlsx')

# Drop rows with any NaN values
df = df.dropna()

# Convert each row to a JSON entry
json_data = []
for index, row in df.iterrows():
    entry = {
        'title': row['title'],
        'bonus': row['bonus'],
        'genre': row['genre'].split(),
        'difficulty': row['difficulty'],
        'categories': row['categories'].split()
    }
    json_data.append(entry)

# Save the JSON data to a file
with open('bonus.json', 'w') as file:
    json.dump(json_data, file)