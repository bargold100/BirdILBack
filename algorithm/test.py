import sys

def my_function(arg1, arg2):
    print(f"arg1: {arg1}")
    print(f"arg2: {arg2}")

if __name__ == "__main__":
    my_function(sys.argv[1], sys.argv[2])