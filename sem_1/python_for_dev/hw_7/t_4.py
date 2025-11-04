import requests

data = {
    "user_id": 1,
    "title": "Задание 3 ДЗ 7",
    "body": "Создание и обработка POST запросов"
}
url = "https://jsonplaceholder.typicode.com/posts"
try:
    response = requests.post(url, json=data)
    if response.status_code == 201:
        print(response.status_code)
        print(response.text)
    if response.status_code == 400:
        print("Сервер не смог обработать запрос, отправленный пользователем на сервер - Bad Request")
    if response.status_code == 404:
        print("Отсутствие запрашиваемого ресурса на сервере - Not Found")

except Exception as e:
    print(e)