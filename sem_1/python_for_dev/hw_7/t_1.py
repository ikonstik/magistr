import asyncio
import aiohttp

async def fetch(url, session):
    async with session.get(url) as response:

        if response.status != 200:
            print(f"Ошибка при получении {url} : {response.status}")
        data = await response.json()
        print(f"Получены данные с {url} : {data}")

async def main():

    urls = ["https://jsonplaceholder.typicode.com/posts/" + str(i) for i in range(1, 11)]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch(url, session) for url in urls]
        await asyncio.gather(*tasks)

if __name__ == '__main__':
    asyncio.run(main())

