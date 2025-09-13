from utils.handling_response import SuccessResponse

class SuccessResponseMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                self._status = message["status"]
            if message["type"] == "http.response.body":
                import json
                try:
                    body = json.loads(message["body"].decode())
                    # Only wrap if not already in success/error format
                    if (
                        isinstance(body, dict)
                        and ("success" not in body)
                        and self._status < 400
                    ):
                        wrapped = SuccessResponse(data=body).dict()
                        message = dict(message)
                        message["body"] = json.dumps(wrapped).encode()
                except Exception:
                    pass
            await send(message)

        await self.app(scope, receive, send_wrapper)
