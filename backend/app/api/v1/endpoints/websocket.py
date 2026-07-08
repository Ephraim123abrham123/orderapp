from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager
from app.core.logging import logger

router = APIRouter()


@router.websocket("")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint to establish real-time connections with clients"""
    await manager.connect(websocket)
    try:
        # Keep connection open and listen for messages or pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
        manager.disconnect(websocket)
