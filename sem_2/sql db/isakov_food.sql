create type courier_status as enum ('свободен', 'занят');
create type payment_status as enum ('ожидает', 'выполнен', 'отменен', 'возврат');
create type order_status as enum ('оформлен', 'доставляется', 'доставлен', 'отменен');
create type restaurant_status as enum ('открыт', 'закрыт');
create type product_status as enum ('доступно', 'недоступно');
create type pay_status as enum ('оплачен', 'не оплачен');
create type type_of_entity as enum ('ресторан', 'блюдо', 'курьер');


create table client (
	client_id uuid primary key default exts.uuid_generate_v4(),
	login varchar(50) unique not null,
	password varchar(100) not null,
	phone_number varchar(11) check (phone_number ~ '^[0-9]{11}$'));

create table street (
	street_id uuid primary key default exts.uuid_generate_v4(),
	street varchar(50) unique not null);

create table house (
	house_id uuid primary key default exts.uuid_generate_v4(),
	street_id uuid not null references street(street_id),
	house_number varchar(15) not null,
	unique (street_id, house_number));

create table apartment_office (
	apartment_office_id uuid primary key default exts.uuid_generate_v4(),
	house_id uuid not null references house(house_id),
	apartment_office_number varchar(10),
	unique (house_id, apartment_office_number));

create table client_address (
	client_id uuid not null references client(client_id),
	apartment_office_id uuid not null references apartment_office(apartment_office_id),
	primary key (client_id, apartment_office_id));

create table restaurant (
	restaurant_id uuid primary key default exts.uuid_generate_v4(),
	resraurant_name varchar(50) not null,
	house_id uuid not null references house(house_id),
	description text,
	open_time time not null,
	close_time time not null,
	company_details text not null,
	rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
	status restaurant_status not null default 'открыт');


create table product_category (
	product_category_id uuid primary key default exts.uuid_generate_v4(),
	product_category_name varchar(50) not null);

create table product (
	product_id uuid primary key default exts.uuid_generate_v4(),
	product_name varchar(50) not null,
	product_category_id uuid not null references product_category(product_category_id),
	price numeric(6, 2) not null check (price >= 0),
	restaurant_id uuid not null references restaurant(restaurant_id),
	photo_url text,
	rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
	status product_status not null default 'доступно',
	description text);

create table courier (
	courier_id uuid primary key default exts.uuid_generate_v4(),
	last_name varchar(20) not null,
	first_name varchar(20) not null,
	middle_name varchar(20),
	passport_series varchar(4) not null check (passport_series ~ '^[0-9]{4}$'),
	passport_number varchar(6) not null unique check (passport_number ~ '^[0-9]{6}$'),
	phone_number varchar(11) check (phone_number ~ '^[0-9]{11}$') unique not null,
	status courier_status not null default 'свободен',
	hire_date date not null,
	dismissal_date date check (dismissal_date is null or dismissal_date > hire_date),
	rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5));

create table courier_pay (
	year int not null,
	month int not null check (month between 1 and 12),
	courier_id uuid not null references courier(courier_id),
	amount numeric(8, 2) not null check (amount >= 0),
	current_rate int not null default 5,
	next_rate int not null default 5,
	primary key (year, month, courier_id));

create table "order" (
	order_id uuid primary key default exts.uuid_generate_v4(),
	courier_id uuid not null references courier(courier_id),
	client_id uuid not null references client(client_id),
	apartment_office_id uuid not null references apartment_office(apartment_office_id),
	restaurant_id uuid not null references restaurant(restaurant_id),
	order_timestamp timestamp not null default current_timestamp,
	delivery_timestamp timestamp,
	order_amount numeric(7, 2) not null check (order_amount > 0),
	comission numeric(6, 2) generated always as (order_amount * 0.1) stored,
	total_amount numeric(7, 2) generated always as (order_amount + (order_amount * 0.1)) stored,
	status order_status not null default 'оформлен',
	order_pay_status pay_status not null default 'не оплачен',
	description text);

create table order_structure (
	order_id uuid references "order"(order_id),
	product_id uuid references product(product_id),
	quantity numeric(4, 2) not null check (quantity > 0),
	primary key (order_id, product_id));

create table payment (
	payment_id uuid primary key default exts.uuid_generate_v4(),
    payment_transaction text unique not null,
    order_id uuid unique references "order"(order_id),
    amount numeric(7, 2) not null check (amount > 0),
    payment_date timestamp not null default current_timestamp,
    status payment_status not null default 'ожидает');

create table review (
	review_id uuid primary key default exts.uuid_generate_v4(),
	client_id uuid not null references client(client_id),
	review_timestamp timestamp default current_timestamp,
	entity_id uuid not null,
	entity_type type_of_entity not null,
	order_id uuid not null references "order"(order_id),
	description text,
	photo_url text,
	rating int not null check (rating >= 1 and rating <= 5));


create user reviewer with password 'NetoSQL2026'

grant connect on database postgres to reviewer

grant usage on schema isakov_food to reviewer;
grant create on schema isakov_food to reviewer;

grant all privileges on schema isakov_food to reviewer;

grant all privileges on all tables in schema isakov_food to reviewer;
alter default privileges in schema isakov_food grant all on tables to reviewer;

grant all privileges on all sequences in schema isakov_food to reviewer;
alter default privileges in schema isakov_food grant all on sequences to reviewer;

grant all privileges on all functions in schema isakov_food to reviewer;
alter default privileges in schema isakov_food grant all on functions to reviewer;

grant usage on schema information_schema to reviewer;
grant select on all tables in schema information_schema to reviewer;

grant usage on schema pg_catalog to reviewer;
grant select on all tables in schema pg_catalog to reviewer;

grant usage on schema exts to reviewer;
grant execute on all functions in schema exts to reviewer;
alter default privileges in schema exts grant execute on functions to reviewer;

create or replace procedure insert_test_data(value int) as $$
declare 
	str text = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';--задаем строку для последующей генерации
	total_amount_var numeric(7, 2); --для получения суммы по заказу и возможности добавления комиссии
    order_timest timestamp;
    delivery_timest timestamp;
    v_entity_type type_of_entity;
    v_entity_id uuid;
    v_order_id uuid;
    v_client_ids uuid[];
    v_address_ids uuid[];
    v_addr_count int;
    v_address_id uuid;
    v_order_ids uuid[];
    v_product_ids uuid[];
    v_product_count int;
    v_product_id uuid;
    v_quantity numeric(4, 2);
	v_amount numeric(7, 2);
	v_pay_time timestamp;
    i record;
    j int;
begin
	for i in 1..value
	loop
		insert into client
		values (
			exts.uuid_generate_v4(), --генерируем uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 40) || '_' || i , --login(50)
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 100), --password(100)
			lpad(floor(random() * 100000000000)::bigint::text, 11, '0')::varchar(11) -- phone_number
			) on conflict (login) do nothing;
			
		insert into courier
		values (
			exts.uuid_generate_v4(), --uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 20), --last_name(20)
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 20), --first_name(20)
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 20), --middle_name(20)
			lpad(floor(random() * 100000000000)::bigint::text, 10, '0')::varchar(4),--pasport_series(4)
			lpad(floor(random() * 100000000000)::bigint::text, 10, '0')::varchar(6),--pasport_number(6)
			lpad(floor(random() * 100000000000)::bigint::text, 11, '0')::varchar(11), -- phone_number(11)
			(enum_range(NULL::courier_status))[1 + floor(random() * 2)], --status
			current_date - (random() * 180)::int, --hire_date за поледние 6 месяцев
			null, --предполагаем, что уволенных нет
			(random() * 5)::numeric(3,2) --rating
			) on conflict (passport_number) do nothing;
		
		insert into product_category
		values (
			exts.uuid_generate_v4(), --uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 50) --name(50)
			);
	end loop;
	
	for i in 1..value * 5
	loop
		insert into street
		values (
			exts.uuid_generate_v4(), --uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 40) || '_' || i
    ) --setreet(50)
    on conflict (street) do nothing;
	end loop;
	
	for i in 1..value * 5
	loop
		insert into house
		values (
			exts.uuid_generate_v4(), --uuid
			(select street_id from street order by random() limit 1), -- random street
			i::text --house_number(15)
			) on conflict (street_id, house_number) do nothing;
	end loop;

	for i in 1..value * 5
	loop
		insert into apartment_office
		values (
			exts.uuid_generate_v4(), --uuid
			(select house_id from house order by random() limit 1), -- random house
			i::text --a_o_number(10)
			) on conflict (house_id, apartment_office_number) do nothing;
	end loop;

	for i in 1..value
	loop
		insert into restaurant
		values (
			exts.uuid_generate_v4(), --uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 50), --name(50)
			(select house_id from house order by random() limit 1), -- random house
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120), --descr
    		make_time((floor(random() * 5) + 8)::int, 0, 0)::time,
    		make_time((floor(random() * 4) + 20)::int, 0, 0)::time,
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120), --company_details
			(random() * 5)::numeric(3,2), --rating
			(enum_range(NULL::restaurant_status))[1 + floor(random() * 2)] --status
			);
	end loop;
 
	for i in 1..value * 5
	loop
		insert into product
		values (
			exts.uuid_generate_v4(), --uuid
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 50), --name(50)
			(select product_category_id from product_category order by random() limit 1), -- random category
			(50 + random() * 4950)::numeric(6,2), -- price
			(select restaurant_id from restaurant order by random() limit 1), -- random restaurant
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120), --photoURL
			(random() * 5)::numeric(3,2), --rating
			(enum_range(NULL::product_status))[1 + floor(random() * 2)], --status
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120) -- descr
			);

		total_amount_var = (random() * 15000)::numeric(7, 2); --генерируем случайное значение суммы из расчета, что стоимость заказа не превышает 15000
		order_timest = current_timestamp - (random() * 262800)::int  * interval '1 min';
		delivery_timest = order_timest + (15 + random() * 165)::int * interval '1 min';
		insert into "order" (
		    order_id,
		    courier_id,
		    client_id,
		    apartment_office_id,
		    restaurant_id,
		    order_timestamp,
		    delivery_timestamp,
		    order_amount,
		    status,
		    order_pay_status,
		    description
			)
		values(
			exts.uuid_generate_v4(), --uuid
			(select courier_id from courier order by random() limit 1),--courier
			(select client_id from client order by random() limit 1),--client
			(select apartment_office_id from apartment_office order by random() limit 1),--a_o
			(select restaurant_id from restaurant order by random() limit 1),--restaurant
			order_timest,
			delivery_timest,
			total_amount_var,
			(enum_range(NULL::order_status))[1 + floor(random() * 4)], --order_status
			(enum_range(NULL::pay_status))[1 + floor(random() * 2)], --pay_status
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120) --descr
			);
		
		v_entity_type := (enum_range(NULL::type_of_entity))[floor(random() * cardinality(enum_range(NULL::type_of_entity))) + 1];
        case v_entity_type
            when 'ресторан' then
                v_entity_id := (select restaurant_id from restaurant order by random() limit 1);
            when 'блюдо' then
                v_entity_id := (select product_id from product order by random() limit 1);
            when 'курьер' then
                v_entity_id := (select courier_id from courier order by random() limit 1);
        end case;
		insert into review 
		values (
			exts.uuid_generate_v4(), --uuid
			(select client_id from client order by random() limit 1),--client
			current_timestamp - (random() * 262800)::int  * interval '1 min', --timestamp
			v_entity_id,
			v_entity_type,
			(select order_id from "order" order by random() limit 1),--order
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120), --descr
			left(repeat(substring(str, 1, ceil(random() * 33)::int), ceil(random() * 3)::int), 120), --URL
			floor(random() * 5 + 1)::int
			);
		
		select order_id, total_amount, order_timestamp 
		into v_order_id, v_amount, v_pay_time
		from "order"
		where order_id not in (select order_id from payment where order_id is not null)
		order by random()
		limit 1;
		insert into payment
		values (
			exts.uuid_generate_v4(), --uuid
			repeat(substring(str, 1, ceil(random() * 33)::int),
				 ceil(random() * 5)::int) || '_' || to_char(now(), 'YYYYMMDDHH24MISSMS') || '_' || i, --transaction
			v_order_id,
			v_amount,
			v_pay_time + (1 + random() * 5)::int * interval '1 min', 
			(enum_range(NULL::payment_status))[1 + floor(random() * 4)] --status
			);
			
	end loop;

	v_client_ids := array(select client_id from client order by client_id);
	v_address_ids := array(select apartment_office_id from apartment_office order by apartment_office_id);

	for i in 1..array_length(v_client_ids, 1) loop
    	v_addr_count := 1 + floor(random() * 3)::int;
    
    	for j in 1..v_addr_count loop
        	v_address_id := v_address_ids[1 + floor(random() * array_length(v_address_ids, 1))];
        
        	insert into client_address (client_id, apartment_office_id)
        	values (v_client_ids[i], v_address_id)
        	on conflict (client_id, apartment_office_id) do nothing;
    	end loop;
	end loop;

	v_order_ids := array(select order_id from "order" order by order_id);
	v_product_ids := array(select product_id from product order by product_id);

	for i in 1..array_length(v_order_ids, 1) loop
    	v_product_count := 1 + floor(random() * 5)::int;
    
    	for j in 1..v_product_count loop
        	v_product_id := v_product_ids[1 + floor(random() * array_length(v_product_ids, 1))];

        	v_quantity := (floor(random() * 10) + 1) / 2.0;
        
        	insert into order_structure (order_id, product_id, quantity)
        	values (v_order_ids[i], v_product_id, v_quantity)
        	on conflict (order_id, product_id) do nothing;
    	end loop;
	end loop;
	--Так как в staff_pay составной PK, то генерировать любое кол-во строк НЕЛЬЗЯ. 
	--Генерируем кол-во строк по формуле: кол-во сотрудников * 12 месяцев, если речь идет о данных за один год 
	for i in 
		select courier_id from courier where courier_id not in (select courier_id from courier_pay) --делаем проверку, что сотрудников, которые есть в базе не используем
	loop
		for j in 1..12--12 месяцев
		loop
			insert into courier_pay
			values(
				2026,--предполагаем, что данные будут только за 2026 год
				j,
				i.courier_id,
				(random() * 120000)::numeric(8, 2));--генерируем случайную зарплату от 0 до 120000
		end loop;
	end loop;
end;
$$ language plpgsql

create or replace procedure erase_test_data()
as $$
begin
	truncate table order_structure cascade;
    truncate table client_address cascade;
    truncate table payment cascade;
    truncate table review cascade;
    truncate table "order" cascade;
    truncate table courier_pay cascade;
    truncate table product cascade;
    truncate table restaurant cascade;
    truncate table apartment_office cascade;
    truncate table house cascade;
    truncate table street cascade;
    truncate table client cascade;
    truncate table courier cascade;
    truncate table product_category cascade; 
end;
$$ language plpgsql

call insert_test_data(500);
call erase_test_data();

set role reviewer;
SELECT current_user;

SET ROLE postgres;
SELECT current_user;

create or replace function rating_change()
returns trigger as $$
declare
    v_avg_rating numeric(3,2);
begin
    case new.entity_type
        when 'ресторан' then
            select coalesce(avg(rating), 0)::numeric(3,2)
            into v_avg_rating
            from review
            where entity_id = new.entity_id
              and entity_type = 'ресторан';
            
            update restaurant
            set rating = v_avg_rating
            where restaurant_id = new.entity_id;
            
        when 'блюдо' then
            select coalesce(avg(rating), 0)::numeric(3,2)
            into v_avg_rating
            from review
            where entity_id = new.entity_id
              and entity_type = 'блюдо';
            
            update product
            set rating = v_avg_rating
            where product_id = new.entity_id;
            
        when 'курьер' then
            select coalesce(avg(rating), 0)::numeric(3,2)
            into v_avg_rating
            from review
            where entity_id = new.entity_id
              and entity_type = 'курьер';
            
            update courier
            set rating = v_avg_rating
            where courier_id = new.entity_id;
    end case;
    
    return new;
end;
$$ language plpgsql;

create trigger rating_change_trigger
    after insert or update of rating or delete on review
    for each row
    execute function rating_change();

create or replace function get_statistic()
returns table(
    restaurant_name varchar(50),
    best_product_name varchar(50),
    total_amount numeric(10, 2),
    avg_amount numeric(10, 2),
    best_user varchar(50)
) as $$
begin
    return query
    with product_stats as (
        select 
            p.restaurant_id,
            p.product_id,
            p.product_name,
            count(os.order_id) as purchase_count,
            row_number() over (partition by p.restaurant_id order by count(os.order_id) desc) as rn
        from product p
        join order_structure os on p.product_id = os.product_id
        group by p.restaurant_id, p.product_id, p.product_name
    ),
    best_products as (
        select 
            restaurant_id,
            product_name as best_product_name
        from product_stats
        where rn = 1
    ),
    client_stats as (
        select 
            o.restaurant_id,
            o.client_id,
            c.login,
            count(o.order_id) as order_count,
            row_number() over (partition by o.restaurant_id order by count(o.order_id) desc) as rn
        from "order" o
        join client c on o.client_id = c.client_id
        group by o.restaurant_id, o.client_id, c.login
    ),
    best_users as (
        select 
            restaurant_id,
            login as best_user
        from client_stats
        where rn = 1
    ),
    order_stats as (
        select 
            restaurant_id,
            coalesce(sum(order_amount), 0) as total_amount,
            coalesce(avg(order_amount), 0) as avg_amount
        from "order"
        group by restaurant_id
    )
    select 
        r.resraurant_name,
        coalesce(bp.best_product_name, 'нет заказов') as best_product_name,
        coalesce(os.total_amount, 0) as total_amount,
        coalesce(os.avg_amount, 0) as avg_amount,
        coalesce(bu.best_user, 'нет клиентов') as best_user
    from restaurant r
    left join best_products bp on r.restaurant_id = bp.restaurant_id
    left join best_users bu on r.restaurant_id = bu.restaurant_id
    left join order_stats os on r.restaurant_id = os.restaurant_id
    order by r.resraurant_name;
end;
$$ language plpgsql;

select * from get_statistic();

create view how_much_money as
with monthly_stats as (
    select 
        date_trunc('month', order_timestamp) as month_date,
        extract(year from date_trunc('month', order_timestamp)) as year,
        extract(month from date_trunc('month', order_timestamp)) as month,
        coalesce(sum(order_amount), 0) as amount_without_commission,
        coalesce(sum(total_amount), 0) as amount_with_commission,
        coalesce(sum(comission), 0) as total_commission
    from "order"
    where status = 'доставлен'
    group by date_trunc('month', order_timestamp)
),
courier_stats as (
    select 
        year,
        month,
        coalesce(sum(amount), 0) as courier_payment
    from courier_pay
    group by year, month
),
ordered_stats as (
    select 
        m.year,
        m.month,
        m.month_date,
        m.amount_without_commission,
        m.amount_with_commission,
        m.total_commission,
        coalesce(c.courier_payment, 0) as courier_payment
    from monthly_stats m
    left join courier_stats c on m.year = c.year and m.month = c.month
    order by m.year, m.month
)
select 
    year as "Год",
    month as "Месяц",
    amount_without_commission as "сумма за месяц без комиссии",
    amount_with_commission as "сумма за месяц с комиссией",
    coalesce(lag(total_commission, 1, 0) over (order by year, month), 0) as "сумма комиссии за предыдущий месяц",
    coalesce(total_commission - lag(total_commission, 1, 0) over (order by year, month), 0) as "разница в комиссии между текущим и предыдущим месяцем",
    courier_payment as "размер оплаты курьерам",
    amount_with_commission - courier_payment as "чистая прибыль"
from ordered_stats
order by year, month;

call insert_test_data(300);
call erase_test_data();
call courier_salary(2026, 1);
call courier_salary(2026, 2);
call courier_salary(2026, 3);
call courier_salary(2026, 4);
call courier_salary(2025, 10);
call courier_salary(2025, 11);
call courier_salary(2025, 12);

select * from how_much_money;

create or replace procedure courier_salary(p_year int, p_month int)
language plpgsql
as $$
declare
    v_courier record;
    v_deliveries_prev_month int;
    v_deliveries_current_month int;
    v_current_rate int;
    v_next_rate int;
    v_salary numeric(8,2);
    v_prev_year int;
    v_prev_month int;
    v_prev_record record;
begin
	-- Граничный случай
    if p_month = 1 then
        v_prev_year := p_year - 1;
        v_prev_month := 12;
    else
        v_prev_year := p_year;
        v_prev_month := p_month - 1;
    end if;
    
    for v_courier in 
        select distinct c.courier_id
        from courier c
        join "order" o on c.courier_id = o.courier_id
        where extract(year from o.delivery_timestamp) = p_year
          and extract(month from o.delivery_timestamp) = p_month
          and o.status = 'доставлен'
    loop
        select current_rate into v_current_rate
        from courier_pay
        where courier_id = v_courier.courier_id
          and year = v_prev_year
          and month = v_prev_month;
        
        if not found then
            v_current_rate := 5;
        end if;
        
        select count(*)
        into v_deliveries_current_month
        from "order"
        where courier_id = v_courier.courier_id
          and extract(year from delivery_timestamp) = p_year
          and extract(month from delivery_timestamp) = p_month
          and status = 'доставлен';
        
        case
            when v_deliveries_current_month between 0 and 100 then v_next_rate := 5;
            when v_deliveries_current_month between 101 and 200 then v_next_rate := 10;
            when v_deliveries_current_month between 201 and 300 then v_next_rate := 20;
            when v_deliveries_current_month between 301 and 400 then v_next_rate := 30;
            when v_deliveries_current_month between 401 and 500 then v_next_rate := 40;
            when v_deliveries_current_month >= 501 then v_next_rate := 50;
            else v_next_rate := 5;
        end case;
        
        select coalesce(sum(comission), 0) into v_salary
        from "order"
        where courier_id = v_courier.courier_id
          and extract(year from delivery_timestamp) = p_year
          and extract(month from delivery_timestamp) = p_month
          and status = 'доставлен';
        
        v_salary := v_salary * (v_current_rate / 100.0);
        
        insert into courier_pay (year, month, courier_id, amount, current_rate, next_rate)
        values (p_year, p_month, v_courier.courier_id, v_salary, v_current_rate, v_next_rate)
        on conflict (year, month, courier_id) 
        do update set 
            amount = excluded.amount,
            current_rate = excluded.current_rate,
            next_rate = excluded.next_rate;

    end loop;
end;
$$;

