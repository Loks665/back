const express = require('express');
const app = express();
//app.use(cors());
const fs = require('fs'); 
const path = require('path');
const localhost = '172.31.1.203';
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

data_path = {
  "users": path.join(__dirname, 'data/users.json'),
  "teams": path.join(__dirname, 'data/teams.json'),
  "courses": path.join(__dirname, 'data/courses.json'),
  "achievements": path.join(__dirname, 'data/achievements.json')
 // "data": path.join(__dirname, 'data.json'),
}

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


/*registration
  name
  login
  password
*/
app.post('/registration', (req, res) => {
  const info = req.body; 
  const {name, login, password, type} = info;
  console.log('Registration req: ', name, login, password);
  
  if (name == undefined) return res.status(400).send({ error: `undefined param. name: ${name} login: ${login} password: ${password != undefined}`});
  let data = read_data(data_path["users"])
  const user = data[login]
  if (user != null) return res.status(200).send({ error: 'Пользователь с таким логином уже существует'})

  data[login] = {
    type: type != undefined ? type : 'user',
    name: name,
    password: password,
    avatar: "default.jpg",
    teamId: -1,
    points: 0,
    branchNow: "",
    achievements: [],
    completedCourses: [],
    elephantsId: []
  }

  write_data(data, data_path["users"])
  console.log('wow new user! ', name, login, password);
  return res.status(400).send({ text: 'Пользователь добавлен' })
});


/*login
  login
  password
*/
app.post('/login', (req, res) => {
  const info = req.body;
  const { login, password } = info;
  const data = read_data(data_path["users"]);
  const user = data[login];
  console.log('\n\nLogin req: ', login, password);
  if (user == null) return res.status(400).send({ error: 'Пользователь не найден'});
  if (user["password"] != password) return res.status(400).send({ error: 'Неверный пароль'});
  console.log('Пользователь авторизован!');
  res.status(200).send({ text: 'Пользователь авторизориван!'});
});


/*user page
  login
*/
app.post('/userpage', (req, res) => { 
  const info = req.body;
  const { login } = info;
  const usersData = read_data(data_path["users"]);
  const user = usersData[login]
  if (user == undefined) return res.status(400).send({ error: 'Пользователь не найден'});
  const teamId = user["teamId"];
  if (teamId == -1) return res.status(200).send({ error: 'Пользователь не в команде', name: user["name"], login: user["login"]});
  const teamData = read_data(data_path["teams"])[teamId];
  if (teamData == undefined) return res.status(400).send({ error: 'Команда не найдена', name: user["name"], login: user["login"], teamId: teamId});
  let teammates = [];
  for (const id in teamData['members']) {
    const member = teamData["members"][id];
    const teamUser = usersData[member];
    teammates.push({
      name: teamUser["name"],
      login: teamUser["login"],
      points: teamUser["points"],
      avatar: teamUser["avatar"],
    })
  }

  return res.status(200).send({
    name: user["name"],
    login: user["login"],
    avatar: user["avatar"],
    points: user["points"],
    //branchNow: user["branchNow"],
    achievements: user["achievements"], 
    completedCourses: user["completedCourses"],
    elephantsId: user["elephantsId"],
    
    teamName: teamData["name"],
    teammates: teammates
  })


});





// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://${localhost}:${port}`);
});
