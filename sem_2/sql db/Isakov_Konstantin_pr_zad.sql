-- 1) Получите количество проектов, подписанных в 2023 году.
select count(p)
from project p 
where date_part('year', p.sign_date) = 2023

-- 2) Получите общий возраст сотрудников, нанятых в 2022 году.
select date_trunc('day', sum(age(p.birthdate)))
from employee e
join person p on e.person_id = p.person_id 
where date_part('year', e.hire_date) = 2022

-- 3) Получите сотрудника, у которого фамилия начинается на М (всего в фамилии 8 букв) и который работает дольше других.
--    Если таких сотрудников несколько, выведите одного случайного
select concat(p.first_name, ' ', p.last_name), e.hire_date 
from employee e 
join person p on e.person_id = p.person_id 
where p.last_name like 'М%' and length(p.last_name) = 8
order by e.hire_date, random()
limit 1

-- 4) Получите среднее значение полных лет сотрудников, которые уволены и не задействованы на проектах.

select 
    case 
        when avg(date_part('year', age(p.birthdate))) is null then 0
        else avg(date_part('year', age(p.birthdate)))
        end
from employee e 
join person p on e.person_id = p.person_id 
where e.dismissal_date is not null 
and not exists (select 1 
    			from project p2 
    			where e.employee_id = any(p2.employees_id) 
       			or e.employee_id = p2.project_manager_id)


-- 5) Чему равна сумма полученных платежей от контрагентов из Жуковский, Россия?
select sum(pp.amount)
from project_payment pp 
join project p on pp.project_id = p.project_id
join customer c on p.customer_id = c.customer_id
join address a on c.address_id = a.address_id
join city c2 on a.city_id = c2.city_id 
join country c3 on c2.country_id = c3.country_id 
where c2.city_name = 'Жуковский' and c3.country_name = 'Россия'
and pp.fact_transaction_timestamp is not null

-- 6) Пусть руководитель проекта получает премию в 1% от стоимости завершённого проекта.
--    Если взять завершённые проекты, какой руководитель проекта получит самый большой бонус?
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

-- 7) Получите накопительный итог планируемых авансовых платежей на каждый месяц в отдельности.
--    Выведите в результат те даты планируемых платежей, которые идут после преодоления накопительной суммой значения в 30 000 000.

with cte3 as (
    select plan_payment_date, amount, sum(amount) over (
    partition by date_trunc('month', plan_payment_date)
    order by plan_payment_date) as summ
    from project_payment pp
    where payment_type = 'Авансовый')
select 
    min(plan_payment_date) as plan_payment_date,
    max(summ) as summ
from cte3
where summ > 30000000
group by date_trunc('month', plan_payment_date)
order by min(plan_payment_date)
	
-- 8) Используя рекурсию, посчитайте сумму фактических окладов сотрудников из структурного подразделения с ID,
--	  равным 17 и из всех дочерних подразделений.
--    В результат выведите одно значение суммы.

with recursive cte4 as (
	select *, 0 as level
	from company_structure
	where unit_id = 17
	union all 
	select cs.*, level + 1 as level
	from cte4
	join company_structure cs on cs.parent_id = cte4.unit_id)
select sum(ep.salary * ep.rate) 
from cte4
join position p on cte4.unit_id = p.unit_id
join employee_position ep on p.position_id = ep.position_id

-- 9) Задание выполняется одним запросом.

--    Сделайте сквозную нумерацию фактических платежей по проектам на каждый год в отдельности в порядке даты платежей.
--    Получите платежи, сквозной номер которых кратен 5.
--    Выведите скользящее среднее размеров платежей с шагом 2 строки назад и 2 строки вперед от текущей.
--    Получите сумму скользящих средних значений.
--    Получите сумму проектов на каждый год.
--    Выведите в результат значение года (годов) и сумму проектов, где сумма проектов меньше, чем сумма скользящих средних значений.

with cte5 as ( -- Нумерация платежей по годам
		select *, row_number() over (partition by date_part('year', pp.fact_transaction_timestamp)
		order by pp.fact_transaction_timestamp) as payment_number
		from project_payment pp
		where pp.fact_transaction_timestamp is not null),
	cte6 as ( -- Платежи номер которых кратен 5
		select *, date_part('year', fact_transaction_timestamp) as year
		from cte5
		where payment_number % 5 = 0),
	cte7 as ( -- Скользящее среднее
		select *, avg(amount) over (
		order by fact_transaction_timestamp
		rows between 2 preceding and 2 following) as avg_payment
		from cte6),
	cte8 as ( -- Сумма скользящих
		select sum(avg_payment) as sum_avg_payment
		from cte7),
	cte9 as ( -- Сумма проектов
		select date_part('year', p.sign_date) as year,
		sum(p.project_cost) as total_sum
		from project p
		group by year)
select cte9.year, cte9.total_sum
from cte9
join cte8 on 1 = 1
where cte9.total_sum < cte8.sum_avg_payment 

-- 10) Создайте материализованное представление, которое будет хранить отчёт следующей структуры:

--		идентификатор проекта;
--		название проекта;
--		дата последней фактической оплаты по проекту;
--		размер последней фактической оплаты;
--		Ф. И. О. руководителей проектов;
--		названия контрагентов;
--		в виде строки — названия типов работ контрагентов.

create materialized view task10 as
	with cte10 as (
		select distinct on (pp.project_id)
		pp.project_id, pp.amount as last_payment,
		pp.fact_transaction_timestamp as payment_date 
		from project_payment pp
		where pp.fact_transaction_timestamp is not null
		order by pp.project_id, pp.fact_transaction_timestamp desc),
	cte11 as (
		select c.customer_id, c.customer_name, string_agg(tow.type_of_work_name, ', ') as works
		from customer c 
		join customer_type_of_work ctow on c.customer_id = ctow.customer_id
		join type_of_work tow on ctow.type_of_work_id = tow.type_of_work_id
		group by c.customer_id)
	select p.project_id, p.project_name, cte10.payment_date as last_payment_date,
	cte10.last_payment, p2.full_fio as manager_fio, cte11.customer_name, cte11.works
	from project p
	join cte10 on p.project_id = cte10.project_id
	join employee e on p.project_manager_id = e.employee_id
	join person p2 on e.person_id = p2.person_id 
	join cte11 on p.customer_id = cte11.customer_id
	order by p.project_id 

-- select * from task10;





