import requests, json, time, os, logging


class CurrencyConverter:

    API_URL = "https://api.exchangerate-api.com/v4/latest/USD"
    CACHE_FILE = "exchange_rates.json"
    CACHE_EXPIRY = 3600
    MAX_RETRIES = 3
    RETRY_DELAY = 2
    _shared_rates = None
    _logger = None

    def __new__(cls):
        if not hasattr(cls, '_instance'):
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.logger = self._get_logger()
            self.rates = self._get_rates()
            self.initialized = True

    def convert(self, amount, valute):
        current_course = self.rates.get(valute.upper(), None)
        if current_course:
            return amount * self.rates[valute.upper()]
        else:
            self.logger.error("Rates not available")
            return None

    def _get_rates(self):
        if CurrencyConverter._shared_rates is not None:
            return CurrencyConverter._shared_rates

        rates = self._load_from_cache()
        if rates:
            CurrencyConverter._shared_rates = rates
            return rates

        rates = self._get_from_network()
        if rates:
            CurrencyConverter._shared_rates = rates
            return rates

        return None

    def _get_from_network(self):
        for attempt in range(self.MAX_RETRIES):
            try:
                response = requests.get(self.API_URL, timeout=10)
                response.raise_for_status()
                data = response.json()
                rates = data['rates']
                self._save_to_cache(rates)
                return rates

            except requests.exceptions.RequestException as e:
                self.logger.error(f"Request failed (attempt {attempt + 1}/{self.MAX_RETRIES}): {e}")
                if attempt < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAY)
                else:
                    self.logger.error("Max retries reached.  Unable to fetch rates.")
                    return None

            except (json.JSONDecodeError, KeyError) as e:
                self.logger.error(f"Error processing JSON response: {e}")
                return None
        return None

    def _load_from_cache(self):
        if not os.path.exists(self.CACHE_FILE):
            return None

        now = time.time()
        try:
            with open(self.CACHE_FILE, 'r') as f:
                data = json.load(f)
            if now - data['timestamp'] < self.CACHE_EXPIRY:
                return data['rates']
            else:
                self.logger.info(f"Cache expired: {self.CACHE_FILE}")
        except (json.JSONDecodeError, KeyError) as e:
            self.logger.warning(f"Invalid cache file: {e}")
            return None

    def _save_to_cache(self, rates):
        try:
            data = {'timestamp': time.time(), 'rates': rates}
            with open(self.CACHE_FILE, 'w') as f:
                json.dump(data, f)
        except IOError as e:
            self.logger.error(f"Error saving to cache: {e}")

    def _get_logger(self):
        if CurrencyConverter._logger is None:
            CurrencyConverter._logger = self._setup_logger()
        return CurrencyConverter._logger

    def _setup_logger(self):
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        ch = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)
        return logger
