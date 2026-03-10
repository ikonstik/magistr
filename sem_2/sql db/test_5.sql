-- Какое количество сотрудников имеет самую большую з/п?
/*
select count(*)
from employee_position
where salary = (select max(salary) from employee_position) 
 */

-- Какое количество фактических платежей было принято в октябре 2022 года по проектам, где работали сотрудники (не руководители проектов) с фамилией, начинающейся на К?
/*
select count(distinct pp.project_payment_id) as payment_count
from project_payment pp 
join project p on pp.project_id = p.project_id 
join employee e on e.employee_id = any(p.employees_id)
join person p3 on e.person_id = p3.person_id 
where p3.last_name like 'К%'
  and e.employee_id != p.project_manager_id  -- не руководитель
  and date_part('year', pp.fact_transaction_timestamp) = 2022
  and date_part('month', pp.fact_transaction_timestamp) = 10
  */

-- Какое количество сотрудников родилось в 1984 году и проживает в Одинцово?
/*
select count(*)
from employee e
join person p on e.person_id = p.person_id 
join address a on p.address_id = a.address_id
join city c on a.city_id = c.city_id
where c.city_name = 'Одинцово' 
	and date_part('year', p.birthdate) = 1984
 */

-- В каком структурном подразделении (значение идентификатора) работает наибольшее количество сотрудников?


-- Чему равно среднее значение дельты зарплатной вилки?
select avg(max_salary - min_salary)
from grade_salary

