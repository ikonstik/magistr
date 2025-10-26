from threading import Thread

inp_list = [i for i in range(1, int(input("Введите число "))+1)]
sq_list = []
kub_list = []

def sq() -> None:
    sq_list.extend([x**2 for x in inp_list])

def kub() -> None:
    kub_list.extend([x**3 for x in inp_list])

if __name__ == '__main__':

    t1 = Thread(target=sq)
    t2 = Thread(target=kub)

    t1.start()
    t2.start()

    t1.join()
    t2.join()

    print(sq_list)
    print(kub_list)

