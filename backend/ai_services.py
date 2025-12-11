import openai
import os
from dotenv import load_dotenv
import pdfplumber
import json
from commodity_groups import COMMODITY_GROUPS

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    print(f"Extracted {len(text)} characters from PDF")
    print(f"First 500 characters: {text[:500]}")
    return text

def extract_vendor_offer_data(pdf_text: str) -> dict:
    """Use OpenAI to extract structured data from vendor offer text"""

    # Check if API key is available
    if not openai.api_key or "your-api-key" in openai.api_key.lower():
        raise ValueError("No valid OpenAI API key found. Please set OPENAI_API_KEY in .env file")

    prompt = f"""
You are an AI assistant helping to extract procurement information from vendor offers.
Extract the following information from the text below and return it as a JSON object:

- vendor_name: Name of the vendor/company
- vat_id: VAT ID (Umsatzsteuer-Identifikationsnummer), usually starts with country code like DE
- department: Department name if mentioned (look for phrases like "Offered to:", "Department:", etc.)
- order_lines: Array of items with:
  - position_description: Product/service name
  - unit_price: Price per unit (as number, without currency symbol)
  - amount: Quantity (as number, can be fractional like 1.5 or 2.75)
  - unit: Unit of measure (e.g., "licenses", "pieces", "units", "kg", "hours")
  - total_price: Total for this line (as number)
- total_cost: Total cost of the entire offer (as number)

If any field is not found, use null for that field.
For prices, extract only the numeric value without currency symbols.

Vendor Offer Text:
{pdf_text}

Return ONLY valid JSON, no additional text.
"""

    print("Calling OpenAI API for data extraction...")
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a data extraction assistant. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )

    result = response.choices[0].message.content.strip()
    print(f"OpenAI response: {result[:200]}...")

    # Remove markdown code blocks if present
    if result.startswith("```json"):
        result = result[7:]
    if result.startswith("```"):
        result = result[3:]
    if result.endswith("```"):
        result = result[:-3]

    parsed_data = json.loads(result.strip())
    print(f"Successfully parsed data: {parsed_data}")
    return parsed_data

def classify_commodity_group(title: str, order_lines: list) -> dict:
    """Use OpenAI to classify the request into the correct commodity group"""

    # Prepare commodity groups list for the prompt
    groups_text = "\n".join([f"{g['id']}: {g['category']} - {g['group']}" for g in COMMODITY_GROUPS])

    # Prepare order lines description
    items_text = "\n".join([f"- {line.get('position_description', '')}" for line in order_lines])

    prompt = f"""
You are a procurement classification assistant. Based on the request title and items, classify it into the most appropriate commodity group.

Request Title: {title}

Items:
{items_text}

Available Commodity Groups:
{groups_text}

Return ONLY a JSON object with:
- commodity_group_id: The ID (e.g., "031")
- commodity_group: The full name (e.g., "Software")
- confidence: Your confidence level (high/medium/low)

Return ONLY valid JSON, no additional text.
"""

    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a classification assistant. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        result = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if result.startswith("```json"):
            result = result[7:]
        if result.startswith("```"):
            result = result[3:]
        if result.endswith("```"):
            result = result[:-3]

        return json.loads(result.strip())
    except Exception as e:
        print(f"Error classifying commodity group: {e}")
        return {
            "commodity_group_id": None,
            "commodity_group": None,
            "confidence": "low"
        }
