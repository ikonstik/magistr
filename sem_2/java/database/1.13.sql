-- USE university_db;

-- create table student_courses (
-- student_id int,
-- course_id int,
-- enrollment_date date not null,
-- primary key (student_id, course_id),
-- foreign key (student_id) references students(ID),
-- foreign key (course_id) references courses(ID)
-- );

-- show tables

-- insert into coursesstudent_coursesstudent_courses (course_name, course_description) values
-- ('Математика', 'Основы математического анализа и алгебры'),
-- ('Физика', 'Классическая и современная физика'),
-- ('Программирование', 'Основы программирования на Python'),
-- ('История', 'История России и мира'),
-- ('Литература', 'Русская и зарубежная литература');

-- INSERT INTO students (first_name, last_name, email, enrollment_date) VALUES
-- ('Иван', 'Иванов', 'ivan.ivanov@university.edu', '2023-09-01'),
-- ('Петр', 'Петров', 'petr.petrov@university.edu', '2023-09-01'),
-- ('Мария', 'Сидорова', 'maria.sidorova@university.edu', '2023-09-01'),
-- ('Анна', 'Козлова', 'anna.kozlova@university.edu', '2023-09-15'),
-- ('Сергей', 'Морозов', 'sergey.morozov@university.edu', '2023-09-15'),
-- ('Елена', 'Васильева', 'elena.vasileva@university.edu', '2023-10-01');

-- insert into student_courses (student_id, course_id, enrollment_date) values
-- (1, 1, '2023-09-01'), -- Математика (ID курса: 1)
-- (1, 2, '2023-09-01'), -- Физика (ID курса: 2)
-- (1, 3, '2023-09-01'), -- Программирование (ID курса: 3)
-- (2, 1, '2023-09-01'), -- Математика (ID курса: 1)
-- (2, 3, '2023-09-01'), -- Программирование (ID курса: 3)
-- (3, 2, '2023-09-01'), -- Физика (ID курса: 2)
-- (3, 4, '2023-09-01'), -- История (ID курса: 4)
-- (4, 1, '2023-09-15'), -- Математика (ID курса: 1)
-- (4, 4, '2023-09-15'), -- История (ID курса: 4)
-- (4, 5, '2023-09-15'), -- Литература (ID курса: 5)
-- (5, 2, '2023-09-15'), -- Физика (ID курса: 2)
-- (5, 3, '2023-09-15'), -- Программирование (ID курса: 3)
-- (6, 4, '2023-10-01'), -- История (ID курса: 4)
-- (6, 5, '2023-10-01'); -- Литература (ID курса: 5)

-- Количество добавленных курсов
-- SELECT 'Курсы:' as category, COUNT(*) as count FROM courses;

-- Количество добавленных студентов
-- SELECT 'Студенты:' as category, COUNT(*) as count FROM students;

-- Количество записей студентов на курсы
-- SELECT 'Записи на курсы:' as category, COUNT(*) as count FROM student_courses;

-- Запросы

-- Все студенты
-- SELECT id, first_name, last_name, email, enrollment_date
-- FROM students
-- ORDER BY last_name, first_name;

-- Все курсы
-- select ID, course_name, course_description
-- from courses
-- order by course_name

-- Список студентов, записанных на конкретный курс (например, курс с именем "Математика")
-- select s.first_name, s.last_name, s.email, sc.enrollment_date
-- from students s
-- join student_courses sc on s.ID = sc.student_id
-- join courses c on sc.course_id = c.ID
-- WHERE c.course_name = 'Математика'
-- ORDER BY s.last_name, s.first_name;

-- Количество студентов на каждом курсе
-- select c.course_name, count(sc.student_id) as student_count
-- from courses c
-- left join student_courses sc on c.ID = sc.course_id
-- group by c.ID, c.course_name
-- order by c.course_name;

-- Добавить нового студента и записать его на курс
-- insert into students (first_name, last_name, email, enrollment_date) 
-- VALUES ('Новый', 'Студент', 'new.student@university.edu', '2023-11-01');

-- insert into student_courses (student_id, course_id, enrollment_date)
-- SELECT s.id, c.id, '2023-11-01'
-- FROM students s, courses c
-- WHERE s.email = 'new.student@university.edu' 
-- AND c.course_name = 'Программирование';

-- Обновить email студента по его идентификатору
-- update students
-- set email = 'fegfbsdf@yandex.ru'
-- where id = 1;

-- delete from courses
-- WHERE ID NOT IN (SELECT DISTINCT course_id FROM student_courses);

-- create view student_course_info as
-- select 
-- s.first_name,
-- s.last_name,
-- c.course_name,
-- sc.enrollment_date
-- from students s
-- join student_courses sc on s.ID = sc.student_id
-- join courses c on sc.course_id = c.ID
-- order by s.last_name, s.first_name, c.course_name;




