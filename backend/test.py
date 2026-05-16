import pymysql

print("hello world")


try:
    conn = pymysql.connect(
    host="34.100..141",
    user="admin",
    password="aiops-t@",
    database="ai_operations_db",
    port=3306,
    ssl={"ssl_mode": "REQUIRED"}
    )
    print("Wah bhai! Connect ho gaya!")
    conn.close()
except Exception as e:
    print(f"Abhi bhi error hai: {e}")