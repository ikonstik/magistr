import hashlib
import re
import uuid
import pytest
from random import randint
from typing import Optional, Dict

from unittest.mock import patch

from jedi.inference.gradual.typing import Callable



#----------------------------------------------------------------------------------------------------------------------
def calc_price(base_price: float, discount: float, count: int) -> float:
    if (type(base_price) not in (float, int) or
        type(discount) not in (float, int) or
        type(count) != int):
        raise TypeError("Неверный тип данных")
    if count <= 0:
        raise ValueError("Билетов должно быть быльше 0")
    if base_price <= 0:
        raise ValueError("Цена билета должна быть больше 0")
    if discount < 0 or discount > 100:
        raise ValueError("Некорректное значение скидки")
    return (base_price * count) * ((100 - discount) / 100)


#----------------------------------------------------------------------------------------------------------------------
class AvailabilityChecker:

    def __init__(self, mock_mode: bool, mock_seats: int = 0) -> None:
        self.mock_mode = mock_mode
        self.mock_seats = mock_seats

    def check_availability(self, event_id: int, seats_requested: int) -> bool:
        if type(event_id) != int or type(seats_requested) != int:
            raise TypeError("Неверный тип данных")
        if event_id < 0 or seats_requested < 0:
            raise ValueError("Некорректное значение")
        available_seats = self.get_available_seats(event_id)
        return available_seats >= seats_requested

    def get_available_seats(self, event_id: int) -> int:
        if self.mock_mode:
            return self.mock_seats
        return self.db_query(event_id)

    def db_query(self, event_id: int) -> int:
        """Запрос в БД по ID мероприятия"""
        try:
            return randint(0, 100)
        except Exception as e:
            raise ConnectionError("Не удалось подключиться к БД") from e

#----------------------------------------------------------------------------------------------------------------------

class PromoCode:

    def __init__(self, promo_code: str, discount: float,
                 is_active: bool, max_uses: int, current_uses: int = 0) -> None:
        self.promo_code = promo_code
        self.discount = discount
        self.is_active = is_active
        self.max_uses = max_uses
        self.current_uses = current_uses

class PromoRepo:

    def __init__(self, mock_mode: bool, mock_data: Optional[Dict[str, PromoCode]]) -> None:
        self.mock_mode = mock_mode
        self.mock_data = mock_data or {}

    def find_promo(self, promo_code: str) -> Optional[PromoCode]:
        if self.mock_mode:
            return self.mock_data.get(promo_code, None)
        return self.find_promo_db(promo_code)

    def find_promo_db(self, promo_code: str) -> Optional[PromoCode]:
        try:
            return True
        except Exception as e:
            raise ConnectionError("Не удалось подключиться к БД") from e

    def increment_usage(self, promo_code: str) -> bool:
        if self.mock_mode:
            if promo_code in self.mock_data:
                if self.mock_data[promo_code].is_active:
                    self.mock_data[promo_code].current_uses += 1
                    if self.mock_data[promo_code].max_uses == self.mock_data[promo_code].current_uses:
                        self.mock_data[promo_code].is_active = False
                return True
            return False

        return self.increment_db(promo_code)

    def increment_db(self, promo_code: str) -> bool:
        try:
            return True
        except Exception as e:
            raise ConnectionError("Не удалось подключиться к БД") from e

    def apply_promo_code(self, order_id: int, promo_code: str) -> bool:
        if type(order_id) != int or type(promo_code) != str:
            raise TypeError("Неверный тип данных")
        if order_id <= 0:
            raise ValueError("Некорректное значение")
        res = self.find_promo(promo_code)
        if res:
            if res.is_active:
                # Применение промо к заказу
                self.increment_usage(promo_code)
                return True
            return False
        return False

#----------------------------------------------------------------------------------------------------------------------

class BookingRefGenerator:

    def generate_booking_ref(self, user_id: int, event_id: int, mark: int) -> str:
        if type(user_id) != int or type(event_id) != int:
            raise TypeError("Неверный тип данных")
        if user_id <= 0 or event_id <= 0:
            raise ValueError("Некорректное значение")
        if self.check_booking(mark):
            data = str(user_id) + str(event_id)
            hash_object = hashlib.md5(data.encode())
            md5_hash = hash_object.hexdigest()
            return md5_hash + str(uuid.uuid1())
        return "У вас нет билетов на это мероприятие"


    @staticmethod
    def check_booking(mark: int) -> bool:
        if mark == 1:
            return True
        return False

#----------------------------------------------------------------------------------------------------------------------

class ValidationError(Exception):
    pass

class PaymentError(Exception):
    pass

class EmailNotificationService:

    def __init__(self, mock_mode: bool, mock_send_function: Optional[Callable] = None) -> None:
        self.mock_mode = mock_mode,
        self.mock_send_function = mock_send_function

    @staticmethod
    def validate_email( email: str) -> bool:
        if "@" not in email:
            return False
        return True

    @staticmethod
    def check_payment(mark) -> bool:
        if mark == 1:
            return True
        return False

    def send_email(self, email: str, mark) -> bool:
        notification = "Уведомление о бронировании"
        if not self.validate_email(email):
            raise ValidationError("Неверный email")
        if not self.check_payment(mark):
            raise PaymentError("Ошибка оплаты")
        if self.mock_mode:
            return self.send_mock(email, notification)
        else:
            return self.send_real(email, notification)


    def send_mock(self, email: str, notification: str) -> bool:
        try:
            if self.mock_send_function:
                return self.mock_send_function(email, notification)
            return True
        except Exception as e:
            raise ConnectionError("Ошибка соединения с сервером") from e

    def send_real(self, email: str, notification: str) -> bool:
        try:
            return True
        except Exception as e:
            raise ConnectionError("Ошибка соединения с сервером") from e

#----------------------------------------------------------------------------------
@pytest.mark.parametrize(
    "base_price, discount, count, expected_res",
    [
        ("5", 50.5, 0, TypeError),
        (5, "50", 5, TypeError),
        (5, 10, "5", TypeError),
        (5, 10, 5.5, TypeError),
        (0, 50, 5, ValueError),
        (1, 50.5, 0, ValueError),
        (-1, 50.5, 0, ValueError),
        (2.5, 50.5, -5, ValueError),
        (2.5, 120.5, 5, ValueError),
        (10, 10, 5, 45),
        (10, 0, 5, 50),
        (99.9, 12.5, 5, 437.0625)
    ])
def test_calc_price(base_price, discount, count, expected_res):
    if expected_res is ValueError:
        with pytest.raises(ValueError):
            calc_price(base_price, discount, count)
    elif expected_res is TypeError:
        with pytest.raises(TypeError):
            calc_price(base_price, discount, count)
    else:
        assert calc_price(base_price, discount, count) == expected_res


#-----------------------------------------------------------------------------------------------------------

@pytest.mark.parametrize(
    "event_id, seats_requested, expected_res, mock_seats",
    [
        ("5", 5, TypeError, 100),
        (5, "132", TypeError, 100),
        (-10, 10, ValueError, 100),
        (55, -5, ValueError, 100),
        (10, 10, True, 100),
        (10, 400, False, 100),
        (10, 100, True, 100),
        (10, 5, ConnectionError, 100)
    ])
def test_check_availability(event_id, seats_requested, expected_res, mock_seats):
    checker = AvailabilityChecker(True, mock_seats)
    if expected_res is TypeError:
        with pytest.raises(TypeError):
            checker.check_availability(event_id, seats_requested)
    elif expected_res is ValueError:
        with pytest.raises(ValueError):
            checker.check_availability(event_id, seats_requested)
    elif expected_res is ConnectionError:
        with patch.object(AvailabilityChecker, "db_query") as mock_db_query:
            mock_db_query.side_effect = ConnectionError("Не удалось подключиться к БД")
            checker = AvailabilityChecker(False)
            with pytest.raises(ConnectionError):
                checker.check_availability(event_id, seats_requested)
    else:
        assert checker.check_availability(event_id, seats_requested) == expected_res

#-----------------------------------------------------------------------------------------------------


@pytest.fixture
def promo_repo():
    pr1 = PromoCode("new10", 10, True, 1)
    pr2 = PromoCode("spring", 15, True, 50)
    pr3 = PromoCode("sundaysale", 20, False, 3)
    return PromoRepo(True,
                          {"new10": pr1,
                           "spring": pr2,
                           "sundaysale": pr3}
                          )

@pytest.mark.parametrize(
            "order_id, promo_code, expected_res",
            [("50", "spring", TypeError),
             (5, 5, TypeError),
             (-5, "spring", ValueError),
             (15, "spring", True),
             (16, "spring", True),
             (20, "sundaysale", False),
             (40, "springg", False),
             (50, "spring", ConnectionError)]
        )
def test_apply_promo(order_id, promo_code, expected_res, promo_repo):
    if expected_res is TypeError:
        with pytest.raises(TypeError):
            promo_repo.apply_promo_code(order_id, promo_code)
    elif expected_res is ValueError:
        with pytest.raises(ValueError):
            promo_repo.apply_promo_code(order_id, promo_code)
    elif expected_res is ConnectionError:
        with patch.object(PromoRepo, "find_promo_db") as mock_db_request:
            mock_db_request.side_effect = ConnectionError
            promo_repo = PromoRepo(False, {})
            with pytest.raises(ConnectionError):
                promo_repo.apply_promo_code(order_id, promo_code)
    else:
        assert promo_repo.apply_promo_code(order_id, promo_code) == expected_res


def test_new10_lifecycle(promo_repo):
    assert promo_repo.find_promo("new10").is_active == True
    assert promo_repo.find_promo("new10").current_uses == 0

    assert promo_repo.apply_promo_code(10, "new10") == True

    assert promo_repo.find_promo("new10").is_active == False
    assert promo_repo.find_promo("new10").current_uses == 1

    assert promo_repo.apply_promo_code(30, "new10") == False

#-------------------------------------------------------------------------------------------------------

@pytest.fixture
def generator():
    return BookingRefGenerator()

@pytest.mark.parametrize(
    "user_id, event_id, mark, expected_res",
    [
        ("5", 10, 1, TypeError),
        (5, "10", 1, TypeError),
        (5.5, 10, 1, TypeError),
        (-5, 10, 1, ValueError),
        (5, -10, 1, ValueError),
        (123, 456, 1, "success"),
        (1, 2, 1, "success"),
        (999999, 888888, 1, "success"),
        (123, 456, 0, "У вас нет билетов на это мероприятие"),
        (123, 456, 2, "У вас нет билетов на это мероприятие"),
        (123, 456, -1, "У вас нет билетов на это мероприятие")
    ]
)
def test_generate_booking_ref(generator, user_id, event_id, mark, expected_res):
    if expected_res is TypeError:
        with pytest.raises(expected_res):
            generator.generate_booking_ref(user_id, event_id, mark)
    elif expected_res is ValueError:
        with pytest.raises(expected_res):
            generator.generate_booking_ref(user_id, event_id, mark)
    elif expected_res == "success":
        result = generator.generate_booking_ref(user_id, event_id, mark)
        assert len(result) == 32 + 36

        md5_part = result[:32]
        assert re.match(r'^[0-9a-f]{32}$', md5_part)

        uuid_part = result[32:]
        assert re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', uuid_part)
    else:
        result = generator.generate_booking_ref(user_id, event_id, mark)
        assert result == expected_res

def test_same_data(generator):
    user_id = 5
    event_id = 5
    mark = 1
    res1 = generator.generate_booking_ref(user_id, event_id, mark)
    res2 = generator.generate_booking_ref(user_id, event_id, mark)
    assert res1 != res2

#------------------------------------------------------------------------------------------------------

@pytest.fixture
def email_sender():
    return EmailNotificationService(True)

@pytest.mark.parametrize(
    "email, mark, expected_res",
    [("example1yandex.ru", 1, ValidationError),
     ("example1@yandex.ru", 2, PaymentError),
     ("example2@yandex.ru", 1, True),
     ("example3@yandex.ru", 1, ConnectionError)]
)
def test_email_notification(email_sender, email, mark, expected_res):
    if expected_res is ValidationError:
        with pytest.raises(expected_res):
            email_sender.send_email(email, mark)
    elif expected_res is PaymentError:
        with pytest.raises(expected_res):
            email_sender.send_email(email, mark)
    elif expected_res is ConnectionError:
        with patch.object(email_sender, "send_mock") as mock_method:
            mock_method.side_effect = ConnectionError
            with pytest.raises(ConnectionError):
                email_sender.send_email(email, mark)
    else:
        res = email_sender.send_email(email, mark)
        assert res == expected_res

