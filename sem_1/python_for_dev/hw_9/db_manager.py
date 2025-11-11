import csv
from typing import List, Dict, Any

from sqlalchemy import distinct, func, and_
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from studentModel import Student


class DataBaseManager:

    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session


    async def get_all_students(self) -> List[Student]:
        result = await self.db_session.execute(select(Student))

        return result.scalars().all()

    async def insert_student(self, student_data: Dict[str, Any]) -> Student:
        new_student = Student(**student_data)
        self.db_session.add(new_student)
        await self.db_session.commit()
        await self.db_session.refresh(new_student)

        return new_student

    async def load_from_csv(self, csv_file: str) -> List[Student]:

        student_list = []
        with open(csv_file, "r", encoding="utf-8") as csv_file:
            csv_reader = csv.DictReader(csv_file)

            for num, row in enumerate(csv_reader, start=1):
                student_data = {
                    'surname': row['Фамилия'].strip(),
                    'firstname': row['Имя'].strip(),
                    'faculty': row['Факультет'].strip(),
                    'course': row['Курс'].strip(),
                    'grade': int(row['Оценка'].strip())
                }

                student = Student(**student_data)
                student_list.append(student)

        return student_list

    async def save_to_db(self, students: List[Student]) -> None:

        self.db_session.add_all(students)
        await self.db_session.commit()


    async def get_students_by_faculty(self, faculty: str) -> List[Student]:

        result = await self.db_session.execute(select(Student).where(Student.faculty == faculty))
        students = result.scalars().all()
        return students

    async def get_unique_courses(self) -> List[str]:
        stmt = select(distinct(Student.course)).order_by(Student.course)
        result = await self.db_session.execute(stmt)
        courses = result.scalars().all()

        return courses

    async def get_average_grade_by_faculty(self, faculty: str):
        query = select(func.avg(Student.grade)).where(Student.faculty == faculty)
        result = await self.db_session.execute(query)
        average_grade = result.scalar()

        return round(float(average_grade), 2) if average_grade else 0.0

    async def get_students_by_course_low_grade(self, course: str, max_grade: int = 30) -> List[Student]:
        stmt = select(Student).where(
            and_(
                Student.course == course,
                Student.grade < max_grade
            )
        ).order_by(Student.grade.asc())

        result = await self.db_session.execute(stmt)
        students = result.scalars().all()

        return students