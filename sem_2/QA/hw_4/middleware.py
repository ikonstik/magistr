import logging
import functools
import datetime


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def middleware(func):
     @functools.wraps(func)
     def wrapper(*args, **kwargs):
        func_name = func.__name__
        logging.info(f'\033[94m[CALL]\033[0m {func_name} args={args}, kwargs={kwargs}')

        try:
            result = func(*args, **kwargs)
            logging.info(f'\033[92m[SUCCESS]\033[0m {func_name} result={result}')
            return result
        except (ValueError, KeyError) as e:
            logging.error(f'\033[91m[ERROR]\033[0m {func_name} error: {type(e).__name__}: {e}')
            raise
     return wrapper

EVENTS_DB = {
    1: {"title": "Football Match", "available_seats": 10, "date":
        datetime.date(2025, 7, 1)},
    2: {"title": "Basketball Playoffs", "available_seats": 5, "date":
        datetime.date(2025, 7, 2)},
    3: {"title": "Tennis Open", "available_seats": 3, "date":
        datetime.date(2025, 7, 3)},
}

BOOKINGS_DB = {}

@middleware
def create_booking(event_id: int, user_id: int) -> dict:
    if event_id not in EVENTS_DB:
        raise ValueError(f'Event with id {event_id} does not exist')
    
    event_info = EVENTS_DB[event_id]

    if event_info["available_seats"] <= 0:
        raise ValueError("No available seats")
    
    event_info["available_seats"] -= 1

    booking_id = f'{int(datetime.datetime.now().timestamp())} {user_id}'

    BOOKINGS_DATA = {
        "booking_id": booking_id,
        "event_id": event_id,
        "user_id": user_id,
        "title": event_info["title"],
        "date": event_info["date"],
        "created_at": datetime.datetime.now()
    }

    BOOKINGS_DB[booking_id] = BOOKINGS_DATA

    return BOOKINGS_DATA

@middleware
def get_booking(booking_id: str) -> dict:
    return BOOKINGS_DB[booking_id]

if __name__ == "__main__":
    booking = create_booking(event_id=1, user_id=101)
    print("Created: ", booking)
    #booking1 = create_booking(event_id="sdsdg", user_id=101) Инициализируем ошибку

    retrieved = get_booking(booking["booking_id"])
    print("Retrieved: ", retrieved)