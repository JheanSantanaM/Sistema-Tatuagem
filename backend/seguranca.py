import os
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITMO = "HS256"

seguranca = HTTPBearer()


def verificar_token(
    credenciais: HTTPAuthorizationCredentials = Depends(seguranca)
):
    token = credenciais.credentials

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITMO]
    )

    return payload


def verificar_admin(
    payload: dict = Depends(verificar_token)
):
    if payload.get("tipo") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido somente para administradores"
        )

    return payload