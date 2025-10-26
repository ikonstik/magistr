from threading import Thread
from time import sleep


def worker(name: str, delay: int = 1) -> None:
    for i in range(1, 11):
        print(f"Работает поток {name} ")
        print(i)
        sleep(delay)

if __name__ == '__main__':

    t1 = Thread(target=worker, args=("t1",))
    t2 = Thread(target=worker, args=("t2",))
    t3 = Thread(target=worker, args=("t3",))

    t1.start()
    t2.start()
    t3.start()

    t1.join()
    t2.join()
    t3.join()

