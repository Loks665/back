import requests
import kivy
from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.lang.builder import Builder
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.button import Button
from kivy.core.text import LabelBase
from kivy.lang import Builder
"""""
localHost='http://172.31.1.203:3000'
r = requests.get(localHost)
print(r.text)

r=requests.post(localHost+"/login", data = {"username":"123", "password": "222"})
print(r.text)
"""
path=r"C:\Users\user\Documents\clfr\clfr\1052.4.jpg"
layout = FloatLayout()
button = Button(text='Hello world',font_size=40,color=(255,255,255, 1),background_normal=path,size_hint =(.3, .10),pos =(672, 300))
layout.add_widget(button)

button1 = Button(text='Hello world',font_size=40,color=(255,0,0, 100),size_hint =(.3, .10),pos =(672, 416))
layout.add_widget(button1)

    
    
"""""
class LoginPage(Screen):
    def verify_credentials(self):
        if self.ids["login"].text == "username" and self.ids["passw"].text == "password": #Сережа замени юзернейм и пассворд реквестами на бд это сравнение введённого и хранимого на бд
            self.manager.current = "user"

class UserPage(Screen):
    pass

class ScreenManagement(ScreenManager):
    pass

kv_file = Builder.load_file('login.kv')
"""
class MyApp(App):
    def build(self):
        return layout

if name == 'main':
    MyApp().run()