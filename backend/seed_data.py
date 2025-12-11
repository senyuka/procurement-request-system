"""
Script to populate the database with sample procurement requests for demo purposes
"""
import random
from datetime import datetime, timedelta, timezone
from database import SessionLocal, engine, Base
from models import ProcurementRequest, OrderLine, StatusHistory

# Sample data pools
REQUESTORS = ["John Smith", "Maria Garcia", "David Chen", "Sarah Johnson", "Ahmed Hassan"]
DEPARTMENTS = ["IT", "Marketing", "Finance", "Operations", "HR"]
VENDORS = [
    "Microsoft Corporation", "Adobe Inc", "Amazon Web Services",
    "Salesforce", "Oracle", "SAP", "IBM", "Google Cloud",
    "Cisco Systems", "Dell Technologies"
]
VAT_IDS = [
    "DE123456789", "DE987654321", "DE456789123", "DE789123456",
    "DE321654987", "DE654987321", "DE147258369", "DE369258147"
]

PRODUCTS = {
    "Software": [
        ("Microsoft Office 365 Licenses", 15.99, "licenses"),
        ("Adobe Creative Cloud Subscription", 52.99, "licenses"),
        ("Salesforce CRM Licenses", 150.00, "licenses"),
        ("Slack Business+ Subscription", 12.50, "licenses"),
        ("Zoom Enterprise License", 19.99, "licenses")
    ],
    "Hardware": [
        ("Dell Latitude Laptops", 1299.00, "pieces"),
        ("HP Monitors 27 inch", 349.99, "pieces"),
        ("Logitech Keyboards", 89.99, "pieces"),
        ("Cisco Network Switches", 2499.00, "pieces"),
        ("External Hard Drives 2TB", 79.99, "pieces")
    ],
    "Services": [
        ("Cloud Storage", 0.023, "GB"),
        ("Consulting Hours", 150.00, "hours"),
        ("Training Sessions", 500.00, "sessions"),
        ("Support Tickets", 50.00, "tickets"),
        ("API Calls", 0.001, "calls")
    ],
    "Office Supplies": [
        ("Printer Paper A4", 5.99, "reams"),
        ("Office Chairs", 299.00, "pieces"),
        ("Whiteboard Markers", 12.99, "packs"),
        ("Filing Cabinets", 199.00, "pieces"),
        ("Desk Organizers", 24.99, "pieces")
    ]
}

COMMODITY_GROUPS = {
    "Software": ("031", "IT - Software"),
    "Hardware": ("032", "IT - Hardware"),
    "Services": ("041", "Consulting Services"),
    "Office Supplies": ("051", "Office Equipment & Supplies")
}

STATUSES = ["Open", "In Progress", "Closed"]

def generate_sample_requests(count=20):
    """Generate sample procurement requests"""
    db = SessionLocal()

    try:
        print(f"Generating {count} sample procurement requests...")

        for i in range(count):
            # Random category
            category = random.choice(list(PRODUCTS.keys()))
            commodity_group_id, commodity_group = COMMODITY_GROUPS[category]

            # Random vendor and requestor
            vendor = random.choice(VENDORS)
            requestor = random.choice(REQUESTORS)
            department = random.choice(DEPARTMENTS)
            vat_id = random.choice(VAT_IDS)

            # Generate 1-4 order lines
            num_lines = random.randint(1, 4)
            selected_products = random.sample(PRODUCTS[category], min(num_lines, len(PRODUCTS[category])))

            order_lines_data = []
            total_cost = 0

            for product_name, unit_price, unit in selected_products:
                # Random quantity (can be fractional for some products)
                if unit in ["GB", "hours", "calls"]:
                    amount = round(random.uniform(100, 10000), 2)
                elif unit in ["licenses"]:
                    amount = random.randint(5, 100)
                else:
                    amount = random.randint(1, 25)

                total_price = round(unit_price * amount, 2)
                total_cost += total_price

                order_lines_data.append({
                    "position_description": product_name,
                    "unit_price": unit_price,
                    "amount": float(amount),
                    "unit": unit,
                    "total_price": total_price
                })

            # Create title
            title = f"{category} Purchase - {selected_products[0][0]}"
            if len(selected_products) > 1:
                title += f" and more"

            # Random status with realistic distribution
            status_weights = [0.3, 0.4, 0.3]  # 30% Open, 40% In Progress, 30% Closed
            status = random.choices(STATUSES, weights=status_weights)[0]

            # Create procurement request
            request = ProcurementRequest(
                requestor_name=requestor,
                title=title,
                vendor_name=vendor,
                vat_id=vat_id,
                commodity_group_id=commodity_group_id,
                commodity_group=commodity_group,
                total_cost=total_cost,
                department=department,
                status=status
            )

            # Set realistic timestamps (created in the last 30 days)
            days_ago = random.randint(0, 30)
            created_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
            request.created_at = created_at
            request.updated_at = created_at + timedelta(hours=random.randint(1, 48))

            db.add(request)
            db.flush()  # Get the request ID

            # Add order lines
            for line_data in order_lines_data:
                order_line = OrderLine(
                    request_id=request.id,
                    **line_data
                )
                db.add(order_line)

            # Add status history
            status_history = StatusHistory(
                request_id=request.id,
                old_status=None,
                new_status="Open",
                changed_at=created_at,
                notes="Request created"
            )
            db.add(status_history)

            # If status changed, add more history entries
            if status == "In Progress":
                progress_time = created_at + timedelta(hours=random.randint(2, 24))
                status_history = StatusHistory(
                    request_id=request.id,
                    old_status="Open",
                    new_status="In Progress",
                    changed_at=progress_time,
                    notes="Status changed to In Progress"
                )
                db.add(status_history)

            elif status == "Closed":
                progress_time = created_at + timedelta(hours=random.randint(2, 12))
                status_history = StatusHistory(
                    request_id=request.id,
                    old_status="Open",
                    new_status="In Progress",
                    changed_at=progress_time,
                    notes="Status changed to In Progress"
                )
                db.add(status_history)

                closed_time = progress_time + timedelta(hours=random.randint(6, 48))
                status_history = StatusHistory(
                    request_id=request.id,
                    old_status="In Progress",
                    new_status="Closed",
                    changed_at=closed_time,
                    notes="Status changed to Closed"
                )
                db.add(status_history)

            print(f"  {i+1}. Created: {title} - {status} - €{total_cost:,.2f}")

        db.commit()
        print(f"\n✓ Successfully created {count} sample requests!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Sample Data Generator for askLio Procurement System")
    print("=" * 60)
    generate_sample_requests(20)
