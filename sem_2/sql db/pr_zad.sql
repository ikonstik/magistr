-- 1)Получите количество проектов, подписанных в 2023 году.
select count(p)
from project p 
where date_part('year', p.sign_date) = 2023

-- 2)Получите общий возраст сотрудников, нанятых в 2022 году.
select date_trunc('day', avg(age(p.birthdate)))
from employee e
join person p on e.person_id = p.person_id 
where date_part('year', e.hire_date) = 2022

-- 3)Получите сотрудника, у которого фамилия начинается на М (всего в фамилии 8 букв) и который работает дольше других.
-- Если таких сотрудников несколько, выведите одного случайного
select concat(p.first_name, ' ', p.last_name), e.hire_date 
from employee e 
join person p on e.person_id = p.person_id 
where p.last_name like 'М%' and length(p.last_name) = 8
order by e.hire_date, random()
limit 1

-- 4)Получите среднее значение полных лет сотрудников, которые уволены и не задействованы на проектах.
/*
select *
from employee e 
join person p on e.person_id = p.person_id 
left join project p2 on e.employee_id = any(p2.employees_id)
where e.dismissal_date is not null --and p2.employees_id is null
*/

-- 5)Чему равна сумма полученных платежей от контрагентов из Жуковский, Россия?
select sum(pp.amount)
from project_payment pp 
join project p on pp.project_id = p.project_id
join customer c on p.customer_id = c.customer_id
join address a on c.address_id = a.address_id
join city c2 on a.city_id = c2.city_id 
join country c3 on c2.country_id = c3.country_id 
where c2.city_name = 'Жуковский' and c3.country_name = 'Россия'

-- 6)Пусть руководитель проекта получает премию в 1% от стоимости завершённого проекта.
-- Если взять завершённые проекты, какой руководитель проекта получит самый большой бонус?
with cte1 as (
		select *
		from project p 
		where p.status = 'Завершен'),
cte2 as (
		select project_manager_id, p.full_fio, sum(project_cost) * 0.01 as bonus  
		from cte1
		join employee e on cte1.project_manager_id = e.employee_id 
		join person p on e.person_id = p.person_id 
		group by cte1.project_manager_id, p.full_fio)
select project_manager_id, full_fio, bonus
from cte2
where bonus = (select max(bonus) from cte2)

 






