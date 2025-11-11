import asyncio
from database import get_db, init_db
from db_manager import DataBaseManager



async def demo_repository_operations():

    await init_db()

    async for session in get_db():
        repo = DataBaseManager(session)
        students = await repo.load_from_csv("students.csv")
        await repo.save_to_db(students)


        print("=== ДЕМОНСТРАЦИЯ РАБОТЫ РЕПОЗИТОРИЯ ===")

        print("\n1. Вставка одиночной записи:")
        new_student = await repo.insert_student({
            'surname': 'Иванов',
            'firstname': 'Сергей',
            'faculty': 'ФТФ',
            'course': 'Физика',
            'grade': 95
        })
        print(f"Добавлен студент: {new_student}")

        print("\n2. Все студенты:")
        students = await repo.get_all_students()
        for student in students:
            print(f"  {student}")

        print("\n3. Студенты ФТФ:")
        ftf_students = await repo.get_students_by_faculty('ФТФ')
        for student in ftf_students:
            print(f"  {student}")

        print("\n4. Уникальные курсы:")
        unique_courses = await repo.get_unique_courses()
        for course in unique_courses:
            print(f"  {course}")

        print("\n5. Средний балл выбранного факультета:")
        faculty = "ФТФ"
        avr_grade = await repo.get_average_grade_by_faculty(faculty)
        print(f"Средний балл на {faculty}: {avr_grade}")

        print("\n6. Студенты по выбранному курсу с оценкой ниже 30 баллов:")
        low_grade_stud = await repo.get_students_by_course_low_grade("История", 30)
        for student in low_grade_stud:
            print(f"  {student}")


if __name__ == "__main__":
    asyncio.run(demo_repository_operations())