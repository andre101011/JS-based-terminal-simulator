const login_label = "Login: ";
const commandError =
  '<span class="highlighted">Error:</span> orden no encontrada';
var acumPrompt = "";
//lista con el orden de las sesiones activas, la ultima maquina de la lista es la que se está usando
/*ej: la maquina 0(ubuntu) hace ssh a la maquina 1(mint) entonces: 
sessions = [
  {
    "machine":"0",
    "uid":"1000"
  }
],
[
  {
    "machine":"1",
    "uid":"1003"
  }
]

*/
var sessions = [
  {
    machine: 0,
    user: -1,
  },
];

//obtiene la cadena inicial del comando de acuerdo al usuario y la maquina
function getPrepend() {
  var user = getActualUserName();
  var machine = getActualMachineName();

  return user + "@" + machine + ":~$ ";
}

//obtiene el nombre del usuario actual
function getActualUserName() {
  var lastSession = sessions[sessions.length - 1];
  if (lastSession.user != -1)
    return machines[lastSession.machine].users[lastSession.user].name;
  else return "_";
}

//obtiene el nombre de la maquina actual
function getActualMachineName() {
  var lastSession = sessions[sessions.length - 1];
  if (lastSession.user != -1) return machines[lastSession.machine].name;
  else return "_";
}

//ejecuta los comandos a excepción del clear y el login
function searchCommand(command) {
  command = command.split(" ");
  response = "";
  console.log(command);

  switch (command[0]) {
    case "comando2":
      response = "respuesta comando2";
      break;
    case "comando3":
      response = "respuesta comando3";
      break;
    case "":
      break;
    default:
      response = '<span class="highlighted">Error:</span> orden no encontrada';
      break;
  }

  return response;
}

//metodo inicial el ejecutar un comando en la consola
function executeCommand(event) {
  var command = document.getElementById("command").value;
  var prompt = document.getElementById("prompt").innerText;
  if (event.keyCode == 13) {
    //si no hay un usuario logeado ejecuta el login
    if (sessions[0].user === -1) {
      response = login(prompt, command);
      document.getElementById("response-field").innerHTML = response.message;
      document.getElementById("prompt").innerHTML =
        '<span class="green">' + response.prompt + "</span>";
    } else {
      if (command == "clear") {
        acumPrompt = " ";
      } else {
        var answer = searchCommand(command);
        console.log(answer);
        acumPrompt +=
          '<span class="green">' +
          prompt +
          "</span>" +
          command +
          "\n" +
          answer +
          "\n";
      }

      document.getElementById("response-field").innerHTML = acumPrompt;
      document.getElementById("prompt").innerHTML =
        '<span class="green">' + getPrepend() + "</span>";
    }
    document.getElementById("command").value = "";
  }
}

function login(prompt, command) {
  //función de login en la maquina inicial ya que es la unica que se logea por este medio, las demas son por medio de ssh
  if (prompt == "Login:") {
    if (command == "") {
      return {
        message:
          '<span class="highlighted">Error:</span> La sintaxis es "Login: usuario"',
        prompt: login_label,
      };
    }

    users = machines[sessions[0].machine].users;

    logged_user = users.findIndex((user) => user.name == command);
    if (logged_user != -1) {
      sessions[0].user = logged_user;
      return {
        message: "Registro exitoso",
        prompt: getPrepend(),
      };
    }
  }
  return {
    message: '<span class="highlighted">Error:</span> Fallo en el registro',
    prompt: login_label,
  };
}

document.getElementById("prompt").innerHTML =
  '<span class="green">' + login_label + "</span>";

//$('#command').val('user@admin:~$ ');

const machines = [
  {
    name: "ubuntu",
    ip: "191.65.3.2",
    disk: [
      {
        archive: "lamento_boliviano.mp3",
        create_date: "2020-10-10 18:20",
        permissions: "320",
        owner: "1000",
        gowner: "1000",
      },
      {
        archive: "parcial_1.pdf",
        create_date: "2020-09-10 22:20",
        permissions: "320",
        owner: "1001",
        gowner: "1001",
      },
      {
        archive: "maquina_compartida.pdf",
        create_date: "2020-09-02 10:32",
        permissions: "320",
        owner: "1002",
        gowner: "1002",
      },
      {
        archive: "apuntes.docx",
        create_date: "2020-09-08 19:34",
        permissions: "320",
        owner: "1003",
        gowner: "1003",
      },
    ],
    users: [
      {
        name: "root",
        uid: "0",
        gid: "0",
        groups: ["0"],
      },
      {
        name: "daniel",
        uid: "1000",
        gid: "1000",
        groups: ["1000", "1004", "1005"],
      },
      {
        name: "andres",
        uid: "1001",
        gid: "1001",
        groups: ["1001", "1004", "1006"],
      },
      {
        name: "neyder",
        uid: "1002",
        gid: "1002",
        groups: ["1002", "1005", "1006"],
      },
      {
        name: "pedro",
        uid: "1003",
        gid: "1003",
        groups: ["1003", "1006", "1007"],
      },
    ],
    groups: [
      {
        id: "1000",
        name: "daniel",
      },
      {
        id: "1001",
        name: "andres",
      },
      {
        id: "1002",
        name: "neyder",
      },
      {
        id: "1003",
        name: "pedro",
      },
      {
        id: "1004",
        name: "mercadeo",
      },
      {
        id: "1005",
        name: "amigos",
      },
      {
        id: "1006",
        name: "contabilidad",
      },
      {
        id: "1007",
        name: "administracion",
      },
    ],
  },
  {
    name: "mint",
    ip: "191.65.3.3",
    disk: [
      {
        archive: "lamento_boliviano.mp3",
        create_date: "2020-10-10 18:20",
        permissions: "320",
        owner: "1000",
        gowner: "1000",
      },
      {
        archive: "parcial_1.pdf",
        create_date: "2020-09-10 22:20",
        permissions: "320",
        owner: "1001",
        gowner: "1001",
      },
      {
        archive: "maquina_compartida.pdf",
        create_date: "2020-09-02 10:32",
        permissions: "320",
        owner: "1002",
        gowner: "1002",
      },
      {
        archive: "apuntes.docx",
        create_date: "2020-09-08 19:34",
        permissions: "320",
        owner: "1003",
        gowner: "1003",
      },
    ],
    users: [
      {
        name: "root",
        uid: "0",
        gid: "0",
        groups: ["0"],
      },
      {
        name: "daniel",
        uid: "1000",
        gid: "1000",
        groups: ["1000", "1004", "1005"],
      },
      {
        name: "andres",
        uid: "1001",
        gid: "1001",
        groups: ["1001", "1004", "1006"],
      },
      {
        name: "neyder",
        uid: "1002",
        gid: "1002",
        groups: ["1002", "1005", "1006"],
      },
      {
        name: "pedro",
        uid: "1003",
        gid: "1003",
        groups: ["1003", "1006", "1007"],
      },
    ],
    groups: [
      {
        id: "1000",
        name: "daniel",
      },
      {
        id: "1001",
        name: "andres",
      },
      {
        id: "1002",
        name: "neyder",
      },
      {
        id: "1003",
        name: "pedro",
      },
      {
        id: "1004",
        name: "mercadeo",
      },
      {
        id: "1005",
        name: "amigos",
      },
      {
        id: "1006",
        name: "contabilidad",
      },
      {
        id: "1007",
        name: "administracion",
      },
    ],
  },
  {
    name: "mx",
    ip: "191.65.3.4",
    disk: [
      {
        archive: "lamento_boliviano.mp3",
        create_date: "2020-10-10 18:20",
        permissions: "320",
        owner: "1000",
        gowner: "1000",
      },
      {
        archive: "parcial_1.pdf",
        create_date: "2020-09-10 22:20",
        permissions: "320",
        owner: "1001",
        gowner: "1001",
      },
      {
        archive: "maquina_compartida.pdf",
        create_date: "2020-09-02 10:32",
        permissions: "320",
        owner: "1002",
        gowner: "1002",
      },
      {
        archive: "apuntes.docx",
        create_date: "2020-09-08 19:34",
        permissions: "320",
        owner: "1003",
        gowner: "1003",
      },
    ],
    users: [
      {
        name: "root",
        uid: "0",
        gid: "0",
        groups: ["0"],
      },
      {
        name: "daniel",
        uid: "1000",
        gid: "1000",
        groups: ["1000", "1004", "1005"],
      },
      {
        name: "andres",
        uid: "1001",
        gid: "1001",
        groups: ["1001", "1004", "1006"],
      },
      {
        name: "neyder",
        uid: "1002",
        gid: "1002",
        groups: ["1002", "1005", "1006"],
      },
      {
        name: "pedro",
        uid: "1003",
        gid: "1003",
        groups: ["1003", "1006", "1007"],
      },
    ],
    groups: [
      {
        id: "1000",
        name: "daniel",
      },
      {
        id: "1001",
        name: "andres",
      },
      {
        id: "1002",
        name: "neyder",
      },
      {
        id: "1003",
        name: "pedro",
      },
      {
        id: "1004",
        name: "mercadeo",
      },
      {
        id: "1005",
        name: "amigos",
      },
      {
        id: "1006",
        name: "contabilidad",
      },
      {
        id: "1007",
        name: "administracion",
      },
    ],
  },
  {
    name: "kali",
    ip: "191.65.3.5",
    disk: [
      {
        archive: "lamento_boliviano.mp3",
        create_date: "2020-10-10 18:20",
        permissions: "320",
        owner: "1000",
        gowner: "1000",
      },
      {
        archive: "parcial_1.pdf",
        create_date: "2020-09-10 22:20",
        permissions: "320",
        owner: "1001",
        gowner: "1001",
      },
      {
        archive: "maquina_compartida.pdf",
        create_date: "2020-09-02 10:32",
        permissions: "320",
        owner: "1002",
        gowner: "1002",
      },
      {
        archive: "apuntes.docx",
        create_date: "2020-09-08 19:34",
        permissions: "320",
        owner: "1003",
        gowner: "1003",
      },
    ],
    users: [
      {
        name: "root",
        uid: "0",
        gid: "0",
        groups: ["0"],
      },
      {
        name: "daniel",
        uid: "1000",
        gid: "1000",
        groups: ["1000", "1004", "1005"],
      },
      {
        name: "andres",
        uid: "1001",
        gid: "1001",
        groups: ["1001", "1004", "1006"],
      },
      {
        name: "neyder",
        uid: "1002",
        gid: "1002",
        groups: ["1002", "1005", "1006"],
      },
      {
        name: "pedro",
        uid: "1003",
        gid: "1003",
        groups: ["1003", "1006", "1007"],
      },
    ],
    groups: [
      {
        id: "1000",
        name: "daniel",
      },
      {
        id: "1001",
        name: "andres",
      },
      {
        id: "1002",
        name: "neyder",
      },
      {
        id: "1003",
        name: "pedro",
      },
      {
        id: "1004",
        name: "mercadeo",
      },
      {
        id: "1005",
        name: "amigos",
      },
      {
        id: "1006",
        name: "contabilidad",
      },
      {
        id: "1007",
        name: "administracion",
      },
    ],
  },
];
