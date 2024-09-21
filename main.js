const express = require('express');
const app = express();
const port = 3000;

// Обработка запросов на главную страницу
app.get('/', (req, res) => {
  res.send('Привет, мир!');
});

// Обработка запросов на страницу "/about"
app.get('/about', (req, res) => {
  res.send('Это страница "О нас".');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
