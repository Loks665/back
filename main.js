const express = require('express');
const app = express();
//app.use(cors());
const fs = require('fs'); 
const path = require('path');
const localhost = '172.31.1.103';
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
  return res.status(400).send([{ text: 'Пользователь добавлен' }])
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



app.get('/top-teams', (req, res) => {
  const teams = read_data(data_path["teams"]);
  const teamsArray = Object.values(teams);
  teamsArray.sort((a, b) => b.points - a.points);
  const topTeams = teamsArray.slice(0, 3);

  res.send(topTeams);
});

/*user page
  login
*/
app.post('/userpage', (req, res) => { 
  const info = req.body;
  const { login } = info;
  const usersData = read_data(data_path["users"]);
  const user = usersData[login];
  
  if (user == undefined) return res.status(400).send({ error: 'Пользователь не найден' });

  const teamId = user["teamId"];
  if (teamId == -1) {
      return res.status(200).send({ 
          error: 'Пользователь не в команде', 
          name: user["name"], 
          login: user["login"] 
      });
  }

  const teamData = read_data(data_path["teams"])[teamId];
  if (teamData == undefined) {
      return res.status(400).send({ 
          error: 'Команда не найдена', 
          name: user["name"], 
          login: user["login"], 
          teamId: teamId 
      });
  }

  let teammates = [];
  for (const id in teamData['members']) {
      const member = teamData["members"][id];
      const teamUser = usersData[member];
      if (teamUser != undefined) {
        teammates.push({
            name: teamUser["name"],
            login: teamUser["login"],
            points: teamUser["points"],
            avatar: teamUser["avatar"],
        });
      }
  }


  res.status(200).send({
      name: user["name"],
      login: user["login"],
      team: teamData["name"],
      teammates: teammates
  });
});


app.get('/current-course/:teamId', (req, res) => {
    const { teamId } = req.params;  // Получаем ID команды из URL
    const teamsData = read_data(data_path["teams"]);  // Чтение данных команд
    const coursesData = read_data(data_path["courses"]);  // Чтение данных курсов
    
    const team = teamsData[teamId];  // Ищем команду по teamId
    
    if (!team) {
        return res.status(400).send({ error: 'Команда не найдена' });
    }
    
    const currentCourseId = team.currentCourseId;  // Получаем ID текущего курса
    const currentCourse = coursesData[currentCourseId];  // Ищем курс по ID
    
    if (!currentCourse) {
        return res.status(400).send({ error: 'Курс не найден' });
    }
    
    // Возвращаем данные о текущем курсе
    return res.status(200).send({
        courseName: currentCourse.name,
        branches: currentCourse.branch
    });
});

app.post('/start-course', (req, res) => {
  const { teamId, courseId } = req.body;  // Получаем команду и новый курс
  const teamsData = read_data(data_path["teams"]);  // Чтение данных команд
  const usersData = read_data(data_path["users"]);  // Чтение данных пользователей
  const coursesData = read_data(data_path["courses"]);  // Чтение данных курсов

  const team = teamsData[teamId];  // Ищем команду по teamId

  if (!team) {
      return res.status(400).send({ error: 'Команда не найдена' });
  }

  const currentCourseId = team.currentCourseId;  // Получаем ID текущего курса
  const currentCourse = coursesData[currentCourseId];  // Получаем текущий курс

  if (!currentCourse) {
      return res.status(400).send({ error: 'Текущий курс не найден' });
  }

  // Проверка завершённости текущего курса для всех членов команды
  const teamMembers = team.members;  // Список членов команды
  for (const member of teamMembers) {
      const user = usersData[member];
      if (!user) {
          return res.status(400).send({ error: `Пользователь ${member} не найден `});
      }

      // Проверяем, завершил ли пользователь текущий курс
      const hasCompletedCourse = user.completedCourses.some(completed => 
          completed.courseId == currentCourseId
      );

      if (!hasCompletedCourse) {
          return res.status(403).send({ 
              error: `Пользователь ${user.name} не завершил текущий курс`
          });
      }
  }

  // Проверка, существует ли новый курс
  if (!coursesData[courseId]) {
      return res.status(400).send({ error: 'Курс не найден' });
  }

  // Если все завершили текущий курс, обновляем текущий курс на новый
  team.currentCourseId = courseId;

  // Сохранение изменений в файл
  write_data(data_path["teams"], teamsData);

  return res.status(200).send({ message: 'Новый курс успешно начат' });
});


// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://${localhost}:${port}`);
});
