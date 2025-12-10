import dijkstraAlg

with open("input.txt", "r", encoding="UTF-8") as f:
    """Считываем входной файл"""
    f.readline()
    cities = dict()
    cities_list = list()
    routes = dict()
    requests = list()

    line = f.readline().strip()
    while line != "[ROADS]":
        city = line.split(": ")
        cities[(city[1])] = int(city[0])
        cities_list.append(city[1])
        line = f.readline().strip()

    line = f.readline().strip()
    while line != "[REQUESTS]":
        route = line.split(": ")
        edge = route[0].split("-")
        routes[(int(edge[0]), int(edge[1]))] = [int(i) for i in route[1].split(",")]
        line = f.readline().strip()

    line = f.readline().strip()
    while line:
        request = line.split("| ")
        str_edge = request[0].split("->")
        start_city = str_edge[0].strip()
        end_city = str_edge[1].strip()
        priority = request[1].strip("(,)").split(",")

        requests.append((start_city, end_city, priority))
        line = f.readline().strip()

# Построение графа
graph = dijkstraAlg.build_graph(cities, routes)

params = {0: "ДЛИНА: ", 1: "ВРЕМЯ: ", 2: "СТОИМОСТЬ: "}

def get_route_by_parameter(start, finish, parameter, cache):
    """Функция для нахождения кратчайшего маршрута по заданному параметру"""
    dist, prev, total_metrics = dijkstraAlg.dijkstra(graph, start, parameter)
    path = dijkstraAlg.reconstruct_path(prev, finish)

    # Обработка изолированных вершин
    if not path or dist[finish] == dijkstraAlg.INF:
        return None, cache

    route = " -> ".join([cities_list[i - 1] for i in path])

    # Вычисление значений по всем метрикам и добавление маршрута в кэш
    length = total_metrics[0][finish]
    time = total_metrics[1][finish]
    cost = total_metrics[2][finish]

    cache[parameter] = {
        "path": path,
        "route": route,
        "length": length,
        "time": time,
        "cost": cost
    }

    if parameter == 0:
        second_half = f"Д = {dist[finish]}, В = {time}, С = {cost}"
    elif parameter == 1:
        second_half = f"Д = {length}, В = {dist[finish]}, С = {cost}"
    else:
        second_half = f"Д = {length}, В = {time}, С = {dist[finish]}"

    # Формирование строки вывода
    req_str = params[parameter] + route + " | " + second_half

    return req_str, cache

def get_compromise_route(priority_list, cache):
    """Функция для нахождения компромиссного маршрута по заданным приоритетам"""
    priorities = {"Д": 0, "В": 1, "С": 2}

    # Обработка изолированных вершин
    if not cache or len(cache) == 0:
        return "КОМПРОМИСС: Маршрут не найден"

    paths_dict = cache
    first_data = next(iter(paths_dict.values()))
    first_path = first_data.get("path")

    # Обработка случая совпадения всех кратайших маршрутов по каждому из параметров
    if all(cached_data.get("path") == first_path for cached_data in cache.values()):
        return (f"КОМПРОМИСС: {first_data['route']} | Д={first_data['length']},"
                f" В={first_data['time']}, С={first_data['cost']}")

    # Выбираем по приоритетам
    priority_indices = [priorities[p] for p in priority_list]

    # Ищем путь, оптимальный по первому приоритету
    for priority in priority_indices:
        if priority in paths_dict:
            data = paths_dict[priority]
            return f"КОМПРОМИСС: {data['route']} | Д={data['length']}, В={data['time']}, С={data['cost']}"

with open("output.txt", "w", encoding="UTF-8") as f:
    """Запись данных в файл вывода"""
    for index, request in enumerate(requests):
        start, finish, priority = cities[request[0]], cities[request[1]], request[2]
        optimal_paths_cache = {}

        len_str, optimal_paths_cache = get_route_by_parameter(start, finish, 0,
                                                                optimal_paths_cache)
        time_str, optimal_paths_cache = get_route_by_parameter(start, finish, 1,
                                                                optimal_paths_cache)
        cost_str, optimal_paths_cache = get_route_by_parameter(start, finish, 2,
                                                                optimal_paths_cache)
        compromise_str = get_compromise_route(priority, optimal_paths_cache)

        f.write(f"Запрос {index + 1}\n")
        f.write(f"{request[0]} -> {request[1]} | {priority}\n")
        if len_str is not None:
            f.write(len_str + "\n")
        else:
            f.write(f"{params[0]}Маршрут не найден\n")
        if time_str is not None:
            f.write(time_str + "\n")
        else:
            f.write(f"{params[1]}Маршрут не найден\n")
        if cost_str is not None:
            f.write(cost_str + "\n")
        else:
            f.write(f"{params[2]}Маршрут не найден\n")
        f.write(compromise_str + "\n")
        f.write("\n")



