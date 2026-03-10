/*
select full_fio, birthdate
from person
where date_part('year', age('2025.01.01', birthdate)) > 55
order by birthdate
*/

/*
select full_fio, birthdate
from person
where date_part('month', birthdate) = 07
*/

/*select *
from city
where city_name like '% %'
*/

/*select count(*) as count_pr
from project
where project_cost % 9 = 0
*/

/*SELECT COUNT(DISTINCT 
    SPLIT_PART(email, '@', 2)
) AS unique_m_domains_count
FROM customer
WHERE SPLIT_PART(email, '@', 2) LIKE 'm%'
*/

