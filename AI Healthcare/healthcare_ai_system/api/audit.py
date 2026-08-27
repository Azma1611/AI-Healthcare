import logging
import json
from datetime import datetime
import uuid
from api.database import SessionLocal
from api.models import AuditLog
from pythonjsonlogger import jsonlogger

# Set up a dedicated logger for audits
audit_logger = logging.getLogger("security_audit")
audit_logger.setLevel(logging.INFO)
auditHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s')
auditHandler.setFormatter(formatter)
audit_logger.addHandler(auditHandler)

class AuditLogger:
    @staticmethod
    def log_event(event_type: str, user: str, status: str, details: str = ""):
        """
        Logs a security or access event.
        IMPORTANT: NEVER pass PII (patient features, medical notes, real names) into this function.
        """
        event_id = str(uuid.uuid4())
        event = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_id": event_id,
            "event_type": event_type,
            "user": user,
            "status": status,
            "details": details
        }
        
        # Log as a JSON string for easy parsing by SIEM tools
        audit_logger.info(json.dumps(event))
        
        # Save to database
        try:
            with SessionLocal() as db:
                db_log = AuditLog(
                    event_id=event_id,
                    event_type=event_type,
                    username=user,
                    status=status,
                    details=details
                )
                db.add(db_log)
                db.commit()
        except Exception as e:
            audit_logger.error(f"Failed to save audit log to DB: {e}")

    @staticmethod
    def log_prediction(user: str, status: str, risk_level: str = "Unknown"):
        """Logs a prediction request without revealing the input features."""
        AuditLogger.log_event("PREDICTION_REQUEST", user, status, f"Risk Assessed: {risk_level}")

    @staticmethod
    def log_report_analysis(user: str, status: str):
        """Logs a report analysis request without revealing the note text."""
        AuditLogger.log_event("REPORT_ANALYSIS", user, status, "Analyzed medical note.")
