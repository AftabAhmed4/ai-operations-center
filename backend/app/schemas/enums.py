import enum

class OrderType(str, enum.Enum):
    WALK_IN = "Walk-in"
    ONLINE = "Online Delivery"

class WorkflowStatus(str, enum.Enum):
    PROCESSING = "Processing"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    EXECUTED = "Executed"
