@echo off
echo Компиляция проекта...
mvn compile
if %errorlevel% neq 0 (
    echo Ошибка компиляции!
    pause
    exit /b 1
)

echo Запуск приложения...
mvn exec:java -Dexec.mainClass="com.bank.BankApplication"
pause
