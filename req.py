import requests

localHost='http://172.31.1.203:3000'
r = requests.get(localHost)
print('Test req')
print(r.text)

print('registration req')
r=requests.post(localHost+"/registration", data = {"name": "Коля","login":"admin", "password": "222"})
print(r.text)

print('login req')
r=requests.post(localHost+"/login", data = {"login":"admin", "password": "222"})
print(r.text)
