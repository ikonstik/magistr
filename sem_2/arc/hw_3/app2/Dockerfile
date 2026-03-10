FROM python:3.9-slim
RUN pip install "fastapi[standard]" httpx
COPY ./app2.py /home/app2/
CMD ["fastapi", "run", "/home/app2/app2.py"]