"""Connexion à PostgreSQL avec SQLAlchemy (mode synchrone, voir décision E de l'architecture).

- engine : le « moteur » qui gère un groupe de connexions à la base
- SessionLocal : fabrique de sessions ; une session = une conversation avec la base
- get_db : dépendance FastAPI qui ouvre une session par requête puis la ferme
- Base : classe mère de toutes les tables (modèles) qu'on créera ensuite
"""

from collections.abc import Iterator

from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

# pool_pre_ping : vérifie qu'une connexion est encore vivante avant de la réutiliser
# (utile si la base redémarre, ou sur Render après une mise en veille)
engine = create_engine(get_settings().database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Classe mère des modèles SQLAlchemy (tables).

    La convention de nommage donne un nom prévisible à chaque contrainte
    (ex. « uq_products_slug ») : indispensable pour qu'Alembic puisse les modifier plus tard.
    """

    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )


def get_db() -> Iterator[Session]:
    """Fournit une session à une route, et la ferme toujours à la fin (même en cas d'erreur)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
