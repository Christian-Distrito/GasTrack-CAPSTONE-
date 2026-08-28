from fastapi import FastAPI
import uvicorn

from app.routers.companies import router as companies_router

app = FastAPI(title="GasTrack API")

app.include_router(companies_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
