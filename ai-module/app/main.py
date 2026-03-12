from fastapi import FastAPI

app = FastAPI(
    title="Research Intelligence AI Engine",
    description="AI services for research workflow platform",
    version="1.0.0"
)


@app.get("/")
def health_check():
    return {"status": "AI engine running"}