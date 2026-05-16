import asyncio
from typing import Dict

class SSEManager:
    def __init__(self):
        # Maps workflow_id to an asyncio.Queue
        self.queues: Dict[str, asyncio.Queue] = {}

    def get_queue(self, workflow_id: str) -> asyncio.Queue:
        if workflow_id not in self.queues:
            self.queues[workflow_id] = asyncio.Queue()
        return self.queues[workflow_id]

    async def emit(self, workflow_id: str, message: str):
        if workflow_id in self.queues:
            await self.queues[workflow_id].put(message)
        else:
            # If no one is listening yet, we create the queue and put the message
            queue = self.get_queue(workflow_id)
            await queue.put(message)

    def disconnect(self, workflow_id: str):
        if workflow_id in self.queues:
            del self.queues[workflow_id]

# Singleton instance
sse_manager = SSEManager()
