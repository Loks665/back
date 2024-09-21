import requests

localHost='http://172.31.1.203:3000'
r = requests.get(localHost)
print('\n\n\n\n\n\nTest req')
print(r.text)

print('registration req')
r=requests.post(localHost+"/registration", data = {"name": "Коля","login":"admin", "password": "222"})
print(r.text)

print('\nlogin req')
r=requests.post(localHost+"/login", data = {"login":"admin", "password": "222"})
print(r.text)



print('\nuserpage req')
r=requests.post(localHost+"/userpage", data = {"login":"admin"})
print(r.text)
