from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(Integer, primary_key=True, index=True)
    requestor_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    vendor_name = Column(String, nullable=False)
    vat_id = Column(String, nullable=False)
    commodity_group_id = Column(String, nullable=True)
    commodity_group = Column(String, nullable=True)
    total_cost = Column(Float, nullable=False)
    department = Column(String, nullable=False)
    status = Column(String, default="Open")  # Open, In Progress, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order_lines = relationship("OrderLine", back_populates="request", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="request", cascade="all, delete-orphan")


class OrderLine(Base):
    __tablename__ = "order_lines"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("procurement_requests.id"))
    position_description = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    total_price = Column(Float, nullable=False)

    request = relationship("ProcurementRequest", back_populates="order_lines")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("procurement_requests.id"))
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    request = relationship("ProcurementRequest", back_populates="status_history")
