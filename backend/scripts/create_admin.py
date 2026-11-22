"""Crée (ou met à jour) un compte administrateur.

Lancer depuis le dossier backend/ :
    .venv\\Scripts\\python.exe -m scripts.create_admin admin@lepetitgrain.example
Le mot de passe est demandé sans être affiché (et n'apparaît donc pas dans l'historique).
"""

import getpass
import os
import sys

from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models import AdminUser


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage : python -m scripts.create_admin <email>")
        sys.exit(1)
    email = sys.argv[1].strip().lower()
    # Mode non interactif (déploiement, démo) : mot de passe dans la variable ADMIN_PASSWORD
    password = os.environ.get("ADMIN_PASSWORD") or getpass.getpass("Mot de passe (12 caractères minimum) : ")
    if len(password) < 12:
        print("Mot de passe trop court.")
        sys.exit(1)
    if "ADMIN_PASSWORD" not in os.environ and getpass.getpass("Confirmer : ") != password:
        print("Les mots de passe ne correspondent pas.")
        sys.exit(1)

    with SessionLocal() as db:
        admin = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if admin is None:
            admin = AdminUser(email=email, password_hash=hash_password(password))
            db.add(admin)
            print(f"Compte admin créé : {email}")
        else:
            admin.password_hash = hash_password(password)
            print(f"Mot de passe mis à jour : {email}")
        db.commit()


if __name__ == "__main__":
    main()
