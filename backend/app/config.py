from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    max_upload_size_mb: int = 50
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "STATLAB_"}


settings = Settings()
