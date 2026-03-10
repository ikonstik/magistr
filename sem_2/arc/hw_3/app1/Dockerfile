FROM python:3.9-slim
RUN pip install "fastapi[standard]"
COPY ./app1.py /home/app1/
CMD ["fastapi", "run", "/home/app1/app1.py"]