"""
WebSocket Connection Manager.
Tracks, manages, and broadcasts real-time events to connected clients.
"""
from fastapi import WebSocket
from typing import List
from app.core.logging import logger


class ConnectionManager:
    """
    Manages active socket registry, handles lifecycle connections,
    and handles direct/broadcast payloads.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.warning(f"Failed to send direct message to WebSocket client: {str(e)}")
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        logger.info(f"Broadcasting WebSocket event: {message.get('event')} to {len(self.active_connections)} active clients.")
        inactive_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send broadcast message to client: {str(e)}")
                inactive_connections.append(connection)

        for conn in inactive_connections:
            self.disconnect(conn)


manager = ConnectionManager()
