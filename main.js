const express = require('express');
const app = express();
//app.use(cors());
const fs = require('fs'); 
const path = require('path');
const localhost = '172.31.1.203';
const port = 3000;



function read_data(path = dataPath) {
  try {
      const data = fs.readFileSync(path, 'utf-8'); 
      if (data == '') {
          return {};
      }
      const parsedData = JSON.parse(data);
      return parsedData;
  } catch (err) {
      return err.code === 'ENOENT' ? {} : (() => { throw err })();
  }
}

function write_data(newData, path = dataPath) {
  const data = { ...read_data(path), ...newData };
  fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf-8');
}



// Обработка запросов на главную страницу
app.get('/', (req, res) => {
  res.send({string: 'hello', string2: 'world'});
});

// Обработка запросов на страницу "/about"
app.get('/about', (req, res) => {
  res.send('Это страница "О нас".');
});

//login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  
  res.status(400).send({ error: 'Неверный логин или пароль'})
});


// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://${localhost}:${port}`);
});
