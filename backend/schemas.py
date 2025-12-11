from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderLineBase(BaseModel):
    position_description: str
    unit_price: float
    amount: float
    unit: str
    total_price: float

class OrderLineCreate(OrderLineBase):
    pass

class OrderLine(OrderLineBase):
    id: int
    request_id: int

    class Config:
        from_attributes = True

class ProcurementRequestBase(BaseModel):
    requestor_name: str
    title: str
    vendor_name: str
    vat_id: str
    commodity_group_id: Optional[str] = None
    commodity_group: Optional[str] = None
    total_cost: float
    department: str

class ProcurementRequestCreate(ProcurementRequestBase):
    order_lines: List[OrderLineCreate]

class ProcurementRequest(ProcurementRequestBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    order_lines: List[OrderLine]

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    new_status: str
    notes: Optional[str] = None

class ExtractedData(BaseModel):
    vendor_name: Optional[str] = None
    vat_id: Optional[str] = None
    department: Optional[str] = None
    order_lines: List[OrderLineCreate] = []
    total_cost: Optional[float] = None
