from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Union, List, Optional
import operator
import re
import ast
import uvicorn

app = FastAPI(
    title="Калькулятор",
    description="API для выполнения арифметических операций и работы со сложными выражениями",
)


class OperationRequest(BaseModel):
    a: Union[int, float]
    b: Union[int, float]


class ExpressionRequest(BaseModel):
    a: Union[int, float, str]
    op: str
    b: Union[int, float, str]


class StringExpressionRequest(BaseModel):
    expression: str


class CalculatorResponse(BaseModel):
    operation: str
    result: Union[int, float]
    expression: Optional[str] = None


class ExpressionState(BaseModel):
    current_expression: str
    variables: dict


expression_builder = {
    "current_expression": "",
    "variables": {},
    "counter": 0
}

OPERATIONS = {
    '+': operator.add,
    '-': operator.sub,
    '*': operator.mul,
    '/': operator.truediv
}


def safe_eval(expression: str) -> Union[int, float]:
    try:
        allowed_names = {
            'abs': abs, 'round': round, 'min': min, 'max': max,
            'int': int, 'float': float
        }

        safe_globals = {"__builtins__": {}}
        safe_globals.update(allowed_names)

        node = ast.parse(expression, mode='eval')

        for child in ast.walk(node):
            if isinstance(child, (ast.Call, ast.Attribute, ast.Subscript)):
                raise ValueError("Вызовы функций и обращения к атрибутам запрещены")

        return eval(compile(node, filename='<string>', mode='eval'), safe_globals)

    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Деление на ноль")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка вычисления выражения: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Добро пожаловать в продвинутый калькулятор!",
        "available_operations": [
            "GET /add?a=5&b=3",
            "GET /subtract?a=5&b=3",
            "GET /multiply?a=5&b=3",
            "GET /divide?a=6&b=2",
            "POST /expression/build - построение выражения",
            "POST /expression/string - вычисление строкового выражения",
            "GET /expression/state - просмотр текущего выражения",
            "GET /expression/execute - выполнение текущего выражения"
        ]
    }


@app.get("/add", response_model=CalculatorResponse)
async def add_numbers(a: Union[int, float], b: Union[int, float]):
    result = a + b
    return CalculatorResponse(
        operation="addition",
        result=result
    )


@app.get("/subtract", response_model=CalculatorResponse)
async def subtract_numbers(a: Union[int, float], b: Union[int, float]):
    result = a - b
    return CalculatorResponse(
        operation="subtraction",
        result=result
    )


@app.get("/multiply", response_model=CalculatorResponse)
async def multiply_numbers(a: Union[int, float], b: Union[int, float]):
    result = a * b
    return CalculatorResponse(
        operation="multiplication",
        result=result
    )


@app.get("/divide", response_model=CalculatorResponse)
async def divide_numbers(a: Union[int, float], b: Union[int, float]):
    if b == 0:
        raise HTTPException(status_code=400, detail="Деление на ноль невозможно")

    result = a / b
    return CalculatorResponse(
        operation="division",
        result=result
    )


@app.post("/expression/build", response_model=CalculatorResponse)
async def build_expression(request: ExpressionRequest):
    global expression_builder

    if isinstance(request.a, str) and request.a.startswith("expr_"):
        a_value = f"({expression_builder['variables'].get(request.a, request.a)})"
    else:
        a_value = str(request.a)

    if isinstance(request.b, str) and request.b.startswith("expr_"):
        b_value = f"({expression_builder['variables'].get(request.b, request.b)})"
    else:
        b_value = str(request.b)

    new_expression = f"({a_value} {request.op} {b_value})"

    expr_name = f"expr_{expression_builder['counter']}"
    expression_builder['counter'] += 1

    expression_builder['variables'][expr_name] = new_expression
    expression_builder['current_expression'] = new_expression

    return CalculatorResponse(
        operation="expression_building",
        result=0,
        expression=f"{expr_name} = {new_expression}"
    )


@app.post("/expression/string", response_model=CalculatorResponse)
async def evaluate_string_expression(request: StringExpressionRequest):
    try:
        expression = request.expression.strip()

        if not re.match(r'^[0-9+\-*/().\s]+$', expression.replace(' ', '')):
            raise HTTPException(status_code=400, detail="Выражение содержит недопустимые символы")

        result = safe_eval(expression)

        return CalculatorResponse(
            operation="string_evaluation",
            result=result,
            expression=expression
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка обработки выражения: {str(e)}")


@app.get("/expression/state", response_model=ExpressionState)
async def get_expression_state():
    return ExpressionState(
        current_expression=expression_builder['current_expression'],
        variables=expression_builder['variables']
    )


@app.get("/expression/execute", response_model=CalculatorResponse)
async def execute_expression():
    global expression_builder

    if not expression_builder['current_expression']:
        raise HTTPException(status_code=400, detail="Нет активного выражения для выполнения")

    try:
        expression = expression_builder['current_expression']
        result = safe_eval(expression)

        return CalculatorResponse(
            operation="expression_execution",
            result=result,
            expression=expression
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Ошибка выполнения выражения: {str(e)}")


@app.post("/expression/reset")
async def reset_expression():
    global expression_builder
    expression_builder = {
        "current_expression": "",
        "variables": {},
        "counter": 0
    }
    return {"message": "Выражение сброшено"}


@app.post("/calculate/add", response_model=CalculatorResponse)
async def add_numbers_post(request: OperationRequest):
    result = request.a + request.b
    return CalculatorResponse(
        operation="addition",
        result=result
    )


@app.post("/calculate/subtract", response_model=CalculatorResponse)
async def subtract_numbers_post(request: OperationRequest):
    result = request.a - request.b
    return CalculatorResponse(
        operation="subtraction",
        result=result
    )


@app.post("/calculate/multiply", response_model=CalculatorResponse)
async def multiply_numbers_post(request: OperationRequest):
    result = request.a * request.b
    return CalculatorResponse(
        operation="multiplication",
        result=result
    )


@app.post("/calculate/divide", response_model=CalculatorResponse)
async def divide_numbers_post(request: OperationRequest):
    if request.b == 0:
        raise HTTPException(status_code=400, detail="Деление на ноль невозможно")

    result = request.a / request.b
    return CalculatorResponse(
        operation="division",
        result=result
    )


if __name__ == "__main__":


    uvicorn.run(app, host="0.0.0.0", port=8000)