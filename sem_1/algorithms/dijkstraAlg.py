import heapq


def build_graph(cities, routes):
    """Функция для построения графа"""
    graph = {}

    for edge, weights in routes.items():
        u = edge[0]
        v = edge[1]

        # Добавляем прямое ребро
        if u not in graph:
            graph[u] = []
        graph[u].append((v, weights))

        # Добавляем обратное ребро
        if v not in graph:
            graph[v] = []
        graph[v].append((u, weights))

    # Добавляем вершины без ребер
    for i in range(1, len(cities) + 1):
        if i not in graph:
            graph[i] = []

    return graph

INF = 10 ** 9

def dijkstra(graph, start, parameter):
    """Функция для нахождения кратчайшего пути по одному из параметров"""
    n = len(graph) + 1
    dist = [INF] * n
    dist[start] = 0
    prev = [-1] * n

    # Создаем ключевые метрики
    total_length = [INF] * n
    total_time = [INF] * n
    total_cost = [INF] * n

    total_length[start] = 0
    total_time[start] = 0
    total_cost[start] = 0

    pq = []
    heapq.heappush(pq, (0, start))

    while pq:
        d, u = heapq.heappop(pq)

        if u not in graph:
            continue

        if d > dist[u]:
            continue

        for neighbor in graph[u]:
            v = neighbor[0]
            metrics = neighbor[1]
            new_length = total_length[u] + metrics[0]
            new_time = total_time[u] + metrics[1]
            new_cost = total_cost[u] + metrics[2]

            if parameter == 0:
                new_dist = new_length
            elif parameter == 1:
                new_dist = new_time
            else:
                new_dist = new_cost

            if new_dist < dist[v]:
                dist[v] = new_dist
                prev[v] = u

                total_length[v] = new_length
                total_time[v] = new_time
                total_cost[v] = new_cost

                heapq.heappush(pq, (new_dist, v))

    return dist, prev, [total_length, total_time, total_cost]

def reconstruct_path(prev, target):
    """Функция для восстановления кратчайшего пути"""
    path = []
    cur = target

    while  cur != -1:
        path.append(cur)
        cur = prev[cur]

    path.reverse()

    return path