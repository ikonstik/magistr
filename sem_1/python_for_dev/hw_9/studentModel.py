from sqlalchemy import Column, Integer, String
from database import Base


class Student(Base):
    __tablename__ = 'student'

    id = Column(Integer, primary_key=True, autoincrement=True)
    surname = Column(String(50), nullable=False, comment="Фамилия")
    firstname = Column(String(50), nullable=False, comment="Имя")
    faculty = Column(String(50), nullable=False, comment="Факультет")
    course = Column(String(100), nullable=False, comment="Название курса")
    grade = Column(Integer, nullable=False, comment="Оценка")

    def __repr__(self):
        return (f"<Student(surname='{self.surname}', "
                f"firstname='{self.firstname}', faculty='{self.faculty}', "
                f"course='{self.course}', grade={self.grade})>")