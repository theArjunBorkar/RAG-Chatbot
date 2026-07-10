from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)


# class ChatHistory(Base):
#     __tablename__ = "chat_history"

#     id = Column(Integer, primary_key=True, index=True)

#     question = Column(String)
#     answer = Column(String)

#     user_id = Column(Integer, ForeignKey("users.id"))

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True)
    title = Column(String)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)

    question = Column(String)
    answer = Column(String)

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id")
    )

    user_id = Column(Integer, ForeignKey("users.id"))