import asyncio
import aiohttp


async def fetch(url, session, city):
    async with session.get(url) as response:
        if response.status != 200:
            print(f"Ошибка при получении {url} : {response.status}")
        data = await response.json()
        temperature = data["fact"]["temp"]
        return f"{city}: {temperature}"


async def main():
    coords = {"Москва": (55.75222, 37.61556,), "Санкт-Петербург": (59.93863, 30.31413,),
              "Петрозаводск": (61.78491, 34.34691,), "Казань": (55.78874, 49.12214,)}

    access_key = "a5e77945-3d44-4ce4-a9cb-6690eb050daa"
    headers = {
        'X-Yandex-Weather-Key': access_key
    }

    urls_names = []
    res = []
    for city, (lat, lon) in coords.items():
        url = f"https://api.weather.yandex.ru/v2/forecast?lat={lat}&lon={lon}"
        urls_names.append((url, city))
    async with aiohttp.ClientSession(headers=headers) as session:
        tasks = [fetch(url, session, city) for url, city in urls_names]
        res = await asyncio.gather(*tasks)

    print(*res, sep='\n')

if __name__ == "__main__":
    asyncio.run(main())
