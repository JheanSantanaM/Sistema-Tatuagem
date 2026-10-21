from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from database import conectar
import bcrypt
import jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITMO = "HS256"


class Login(BaseModel):
    email: str
    senha: str


@router.post("/login")
def login(dados: Login):

    print("1 - LOGIN RECEBIDO")
    print("E-mail:", dados.email)

    print("2 - TENTANDO CONECTAR AO MYSQL")
    conn = conectar()
    print("3 - CONEXÃO COM MYSQL OK")

    cursor = conn.cursor(dictionary=True)

    print("4 - FAZENDO CONSULTA NO BANCO")

    cursor.execute(
        "SELECT * FROM usuario WHERE email = %s",
        (dados.email,)
    )

    print("5 - CONSULTA EXECUTADA")

    usuario = cursor.fetchone()

    print("6 - USUÁRIO BUSCADO:", usuario)

    conn.close()

    if not usuario:
        print("7 - USUÁRIO NÃO ENCONTRADO")
        return {"erro": "E-mail ou senha inválidos"}

    print("7 - CONFERINDO SENHA")

    senha_confere = bcrypt.checkpw(
        dados.senha.encode("utf-8"),
        usuario["senha"].encode("utf-8")
    )

    print("8 - SENHA CONFERIDA:", senha_confere)

    if not senha_confere:
        return {"erro": "E-mail ou senha inválidos"}

    print("9 - GERANDO TOKEN")

    expira_em = datetime.now(timezone.utc) + timedelta(hours=2)

    payload = {
        "sub": usuario["email"],
        "tipo": usuario["tipo"],
        "exp": expira_em
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITMO
    )

    print("10 - TOKEN GERADO")
    print("11 - LOGIN FINALIZADO")

    return {
        "access_token": token,
        "token_type": "bearer"
    }