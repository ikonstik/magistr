import requests

data = {
    "user_id": 1,
    "title": "Задание 3 ДЗ 7",
    "body": "Создание и обработка POST запросов"
}
url = "https://jsonplaceholder.typicode.com/posts"
response = requests.post(url, json=data)
print(response.status_code)
print(response.text)

