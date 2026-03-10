
-- Из какой страны контрагент с идентификатором 100?
/*
select c3.country_name 
from customer c
join address a on c.address_id = a.address_id
join city c2 on a.city_id = c2.city_id
join country c3 on c2.country_id = c3.country_id
where c.customer_id = 100
*/

-- Как называется структурное подразделение, где числится руководитель, по проекту которого был совершён платёж с идентификатором 443?
/*
select *
from project_payment pp 
join project p on pp.project_id = p.project_id
join employee e on p.project_manager_id = e.employee_id
join employee_position ep on e.employee_id = ep.employee_id
join "position" p2 on ep.position_id = p2.position_id
join company_structure cs on p2.unit_id = cs.unit_id 
where pp.project_payment_id = 443
 */

-- Как называется проект, которым управляет руководитель, проживающий в Туле?
/*
select *
from project p 
join employee e on p.project_manager_id = e.employee_id 
join person p2 on e.employee_id = p2.person_id 
join address a on p2.address_id = a.address_id
join city c on a.city_id = c.city_id
where c.city_name = 'Тула' 
 */

-- Сколько сотрудников было нанято в те же дни, когда планировались платежи по проектам?
/*
 * Неправильно
select count(*)
from employee e 
join project p on e.employee_id = any(p.employees_id)  
join project_payment pp on p.project_id = pp.project_id 
where e.hire_date = pp.fact_transaction_timestamp 
 */

-- На каком проекте не работает (не как руководитель проектов) сотрудник, у которого person_id = 35?
/*
 * Не решил
select *
from person p 
join employee e on p.person_id = e.person_id
where p.person_id = 35 
 */




