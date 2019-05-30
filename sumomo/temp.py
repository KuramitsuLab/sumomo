def fibo(n):
    if n < 2:
        return 1
    else:
        return n * fibo(n-1)

print(fibo(100))