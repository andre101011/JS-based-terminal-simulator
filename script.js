const login_label = "Login: ";
const commandError =
  '<span class="highlighted">Error:</span> orden no encontrada';
var acumPrompt = "";
var lastCommand = [];
var lastCommandIndex = 0;
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
  if (sessions.length == 1 && sessions[0].user == -1) {
    return login_label;
  } else {
    var user = getActualUserName();
    var machine = getActualMachineName();
    if (user != "root") {
      return user + "@" + machine + ":~$ ";
    }else{
      return user + "@" + machine + ":/# ";
    }
  }
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
  switch (command[0]) {
    case "sudo":
      response = sudo(command);
      break;
    case "logout":
      response = logout();
      break;
    case "touch":
      response = touch(command);
      break;
    case "chmod":
      response = chmod(command);
      break;
    case "scp":
      response = scp(command);
      break;
    case "ls":
      response = ls(command);
      break;
    case "cat":
      response = cat(command);
      break;
    case "nano":
      response = nano(command);
      break;
    case "rm":
      response = rm(command);
      break;
    case "ssh":
      response = ssh(command);
      break;
    default:
      if (/^(\.\/)/.test(command[0])) {
        response = execute(command);
      } else {
        response = command[0] + ": no se encontró la orden";
      }
      break;
  }

  return response;
}

function sudo(command) {
  response = "";

  switch (command[1]) {
    case "chown":
      response = chown(command);
      break;
    default:
      return command[1] + ": no se encontró la orden";
  }

  return response;
}

//metodo inicial el ejecutar un comando en la consola
function executeCommand(event) {
  var command = document.getElementById("command").value;

  var prompt = document.getElementById("prompt").innerText;
  if (event.keyCode == 13) {
    lastCommand.push(command);
    lastCommandIndex = lastCommand.length - 1;
    //si no hay un usuario logeado ejecuta el login
    if (sessions[0].user === -1) {
      answer = login(prompt, command);
      buildAcumPrompt(prompt, command, answer);
      document.getElementById("response-field").innerHTML = acumPrompt;
      document.getElementById("prompt").innerHTML =
        '<span class="green">' + getPrepend() + "</span>";
    } else {
      if (command == "clear") {
        acumPrompt = " ";
      } else {
        var answer = searchCommand(command);
        buildAcumPrompt(prompt, command, answer);
      }

      document.getElementById("response-field").innerHTML = acumPrompt;
      document.getElementById("prompt").innerHTML =
        '<span class="green">' + getPrepend() + "</span>";
    }
    document.getElementById("command").value = "";
  } else if (event.keyCode == 38) {
    if (lastCommand.length != 0) {
      document.getElementById("command").value = lastCommand[lastCommandIndex];

      if (lastCommandIndex > 0) {
        lastCommandIndex--;
      }
    }
  } else if (event.keyCode == 40) {
    if (lastCommand.length != 0) {
      document.getElementById("command").value = lastCommand[lastCommandIndex];
      if (lastCommandIndex < lastCommand.length - 1) {
        lastCommandIndex++;
      }
    }
  }
}

function buildAcumPrompt(prompt, command, answer) {
  acumPrompt +=
    '<span class="green">' +
    prompt +
    "</span>" +
    command +
    "\n" +
    answer +
    "\n";
}

function login(prompt, command) {
  //función de login en la maquina inicial ya que es la unica que se logea por este medio, las demas son por medio de ssh
  if (prompt == "Login:") {
    if (command == "") {
      return '<span class="highlighted">Error:</span> La sintaxis es "Login: usuario"';
    }

    users = machines[sessions[0].machine].users;

    logged_user = users.findIndex((user) => user.name == command);
    if (logged_user != -1) {
      sessions[0].user = logged_user;
      return "Registro exitoso";
    }
  }
  return '<span class="highlighted">Error:</span> Fallo en el registro';
}

function logout() {
  if (sessions.length == 1) {
    sessions[0].user = -1;
  } else {
    sessions.pop();
  }
  return "";
}

function touch(command) {
  if (command.length < 2) {
    return '<span class="highlighted">Error:</span> touch nombre_archivo';
  }

  var name = command[1];
  var disk = getCurrentMachineDisk();
  var archive = disk.find((obj) => obj.archive == name);
  var user = getCurrentUser();
  if (archive == undefined) {
    disk.push({
      archive: name,
      create_date: getActualDate(),
      permissions: "320",
      owner: user.uid,
      gowner: user.gid,
    });
    return "";
  } else {
    if (canWrite(user, archive) == true) {
      return "";
    } else {
      return (
        "touch: no se puede efectuar `touch' sobre '" +
        name +
        "': Permiso denegado"
      );
    }
  }
}

function getActualDate() {
  var today = new Date();
  console.log(today);
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  var MM = String(today.getMinutes()).padStart(2, "0");
  var HH = String(today.getHours()).padStart(2, "0");

  today = yyyy + "-" + mm + "-" + dd + " " + HH + ":" + MM;
  console.log(today);
  return today;
}

function chown(command) {
  if (command.length < 4) {
    return "chown: missing operand";
  }
  name_group = command[2].split(":");
  if (name_group < 2) {
    return '<span class="highlighted">Error:</span> sudo chown nombre:grupo archivo';
  }

  var user = getCurrentMachine().users.find((obj) => obj.name == name_group[0]);
  var group = getCurrentMachine().groups.find(
    (obj) => obj.name == name_group[1]
  );
  if (user == undefined) {
    return "chown: usuario inválido: '" + name_group + "'";
  }

  if (group == undefined) {
    return "chown: usuario inválido: '" + name_group + "'";
  }

  var archive = getCurrentMachineDisk().find(
    (obj) => obj.archive == command[3]
  );
  if (archive == undefined) {
    return (
      "chown: no se puede acceder a '" +
      command[3] +
      "': No existe el archivo o el directorio"
    );
  }

  archive.owner = user.uid;
  archive.gowner = group.id;

  return "";
}

function chmod(command) {
  if (command.length < 3) {
    return "chmod: falta un operando";
  }
  var mod = command[1];
  if (isModValid(mod) == false) {
    return "chmod: modo inválido: «" + mod + "»";
  }

  var archive = getCurrentMachineDisk().find(
    (obj) => obj.archive == command[2]
  );
  if (archive == undefined) {
    return (
      "chmod: no se puede acceder a '" +
      command[2] +
      "': No existe el archivo o el directorio"
    );
  }

  var user = getCurrentUser();
  if (
    canWrite(user, archive) == true ||
    user.uid == archive.owner ||
    user.uid == 0
  ) {
    archive.permissions = mod;
  } else {
    return (
      "chmod: no se puede efectuar `chmod' sobre '" +
      archive.archive +
      "': Permiso denegado"
    );
  }
  return "";
}

function isModValid(permissions) {
  var permissions_array = permissions.split("");
  console.log(permissions_array);
  var permissions_array2 = [];
  for (var i = 0; i < permissions_array.length; i++) {
    permissions_array2.push(parseInt(permissions_array[i]));
  }
  console.log(permissions_array2);

  var index = permissions_array2.findIndex((obj) => obj < 0 || obj > 7);

  if (permissions.length != 3 || index != -1) {
    return false;
  }
  return true;
}

function ls(command) {
  var disk = getCurrentMachineDisk();

  var key = command[1];
  var string = "";
  if (command.length > 1) {
    if (key === "-l") {
      for (let index = 0; index < disk.length; index++) {
        string +=
          disk[index].permissions +
          "\t" +
          disk[index].owner +
          "\t" +
          disk[index].gowner +
          "\t" +
          disk[index].create_date +
          "\t" +
          disk[index].archive +
          "\n";
      }
    } else {
      return "argumento no valido";
    }
  } else {
    for (let index = 0; index < disk.length; index++) {
      string += disk[index].archive + " ";
    }
  }
  return string;
}

function cat(command) {
  var disk = getCurrentMachineDisk();
  var archive = disk.filter((disk) => disk.archive == command[1])[0];
  var user = getCurrentUser();

  if (archive != null) {
    if (canRead(user, archive)) {
      return "Leyendo el contenido del archivo ....";
    } else {
      return "No tiene permisos para leer el archivo";
    }
  } else {
    return '<span class="highlighted">Error:</span> archivo no encontrado';
  }
}

function nano(command) {
  var disk = getCurrentMachineDisk();
  var archive = disk.filter((disk) => disk.archive == command[1])[0];
  var user = getCurrentUser();

  if (archive != null) {
    if (canWrite(user, archive)) {
      return "Escribiendo en el archivo ....";
    } else {
      return "No tiene permisos para escribir en el archivo";
    }
  } else {
    return '<span class="highlighted">Error:</span> archivo no encontrado';
  }
}
function rm(command) {
  var disk = getCurrentMachineDisk();
  var archive = disk.filter((disk) => disk.archive == command[1])[0];
  var user = getCurrentUser();
  if (archive != null) {
    //cambiar cuando este listo el comando de los permisos
    if (canWrite(user, archive)) {
      for (var i = 0; i < disk.length; i++) {
        console.log(archive);
        if (disk[i].archive === archive.archive) {
          disk.splice(i, 1);
        }
      }
      return "El archivo se ha eliminado";
    } else {
      return "No tiene permisos para eliminar el archivo";
    }
  } else {
    return '<span class="highlighted">Error:</span> archivo no encontrado';
  }
}

function ssh(command) {
  var remoteAddress = command[1].split("@");
  var remoteMachineIndex = machines.findIndex(
    (machines) => machines.ip == remoteAddress[1]
  );
  var remoteMachine = machines.filter(
    (machines) => machines.ip == remoteAddress[1]
  )[0];
  var ok = false;
  if (remoteMachine != null) {
    var remoteUsers = remoteMachine.users;
    for (var i = 0; i < remoteUsers.length && !ok; i++) {
      if (remoteUsers[i].name == remoteAddress[0]) {
        sessions[sessions.length] = { machine: remoteMachineIndex, user: i };

        prompt = getPrepend();
        ok = true;
      }
    }
  }

  if (!ok) {
    return '<span class="highlighted">Error:</span> no se puede realizar la conexión';
  } else {
    return " ";
  }
}

function scp(command) {
  var disk = getCurrentMachineDisk();
  var get = command[1].includes("@") && command[1].includes(":");
  var user = getCurrentUser();
  console.log(get);
  if (!get) {
    // es para copiar un archivo en el remoto

    var remoteAddress = command[2].split("@");
    var archive = disk.filter((disk) => disk.archive == command[1])[0];

    var remoteMachine = machines.filter(
      (machines) => machines.ip == remoteAddress[1].split(":")[0]
    )[0];

    var ok = false;
    if (remoteMachine != null) {
      var remoteUsers = remoteMachine.users;
      var remoteUser;
      for (var i = 0; i < remoteUsers.length && !ok; i++) {
        if (remoteUsers[i].name == remoteAddress[0]) {
          ok = true;
          remoteUser = remoteUsers[i];
        }
      }
      console.log(ok);
      if (ok && archive != null) {
        archiveCopy = Object.assign({}, archive);

        if (canRead(user, archive)) {
          //si el usuario local puede leer el archivo local
          var name = command[2].split(":")[1];
          if (name != ".") {
            console.log(name);
            archiveCopy.archive = name;
          } else {
            name = archive.archive;
          }
          var archiveD = remoteMachine.disk.filter(
            (disk) => disk.archive == name
          )[0];
          if (archiveD != null) {
            if (!canWrite(remoteUser, archiveD)) {
              // si el usuario remoto puede escribir en el archivo destino
              return '<span class="highlighted">Error:</span> no tiene permisos de escritura sobre el archivo destino';
            }
          } else {
            console.log("LLega" + archiveD);
            archiveCopy.owner = remoteUser.uid;
            archiveCopy.gowner = remoteUser.gid;
            remoteMachine.disk.push(archiveCopy);
          }
          return archive.archive + "                                   100%";
        } else {
          return '<span class="highlighted">Error:</span> no tiene permisos de lectura sobre el archivo origen';
        }
      } else {
        return '<span class="highlighted">Error:</span> el archivo origen no existe';
      }
    }
  } else {
    //al entrar significa que es para traer un archivo del remoto

    var remoteAddress = command[1].split("@");

    var remoteMachine = machines.filter(
      (machines) => machines.ip == remoteAddress[1].split(":")[0]
    )[0];

    var ok = false;

    if (remoteMachine != null) {
      var remoteUsers = remoteMachine.users;
      var remoteUser;
      for (var i = 0; i < remoteUsers.length && !ok; i++) {
        if (remoteUsers[i].name == remoteAddress[0]) {
          ok = true;
          remoteUser = remoteUsers[i];
        }
      }
      //este es el archivo remoto
      var archive = remoteMachine.disk.filter(
        (disk) => disk.archive == remoteAddress[1].split(":")[1]
      )[0];

      if (ok && archive != null) {
        archiveCopy = Object.assign({}, archive);
        console.log(archive);

        if (canRead(remoteUser, archive)) {
          // si el usuario remoto puede leer el arhivo remoto
          var name = command[2];
          if (name != ".") {
            archiveCopy.archive = name;
          } else {
            name = archive.archive;
          }

          var archiveD = disk.filter((disk) => disk.archive == name)[0];
          if (archiveD != null) {
            if (!canWrite(user, archiveD)) {
              // si el usuario local puede escirbir sobre el archivo local
              return '<span class="highlighted">Error:</span> no tiene permisos de escritura sobre el archivo destino';
            }
          } else {
            archiveCopy.owner = user.uid;
            archiveCopy.gowner = user.gid;
            disk.push(archiveCopy);
          }

          return archive.archive + "                                   100%";
        } else {
          return '<span class="highlighted">Error:</span> no tiene permisos de lectura sobre el archivo origen';
        }
      } else {
        return '<span class="highlighted">Error:</span> el archivo origen no existe';
      }
    }
  }
}

function execute(command) {
  fileName = command[0].replace(/^(\.\/)/, "");
  var disk = getCurrentMachineDisk();
  var archive = disk.filter((disk) => disk.archive == fileName)[0];
  var user = getCurrentUser();

  if (archive != null) {
    if (canExecute(user, archive)) {
      return "Ejecutando el archivo ....";
    } else {
      return "No tiene permisos para ejecutar el archivo";
    }
  } else {
    return '<span class="highlighted">Error:</span> archivo no encontrado';
  }
}

function canRead(user, archive) {
  if (archive.owner === user.uid) {
    //es el dueño
    return Number(archive.permissions.charAt(0)) >= 4;
  } else {
    //no es el dueño
    if (user.groups.includes(archive.gowner)) {
      //Está en el grupo
      return Number(archive.permissions.charAt(1)) >= 4;
    } else {
      //No está en el grupo
      return Number(archive.permissions.charAt(2)) >= 4;
    }
  }
}

function canWrite(user, archive) {
  if (archive.owner === user.uid) {
    //es el dueño
    let x = Number(archive.permissions.charAt(0));
    return x == 2 || x == 3 || x == 6 || x == 7;
  } else {
    //no es el dueño
    if (user.groups.includes(archive.gowner)) {
      //Está en el grupo
      let x = Number(archive.permissions.charAt(1));
      return x == 2 || x == 3 || x == 6 || x == 7;
    } else {
      //No está en el grupo
      let x = Number(archive.permissions.charAt(2));
      return x == 2 || x == 3 || x == 6 || x == 7;
    }
  }
}

function canExecute(user, archive) {
  if (archive.owner === user.uid) {
    //es el dueño
    let x = Number(archive.permissions.charAt(0));
    return x % 2;
  } else {
    //no es el dueño
    if (user.groups.includes(archive.gowner)) {
      //Está en el grupo
      let x = Number(archive.permissions.charAt(1));
      return x % 2;
    } else {
      //No está en el grupo
      let x = Number(archive.permissions.charAt(2));
      return x % 2;
    }
  }
}

function getCurrentMachine() {
  var lastSession = sessions[sessions.length - 1];
  if (lastSession.user != -1) return machines[lastSession.machine];
  else return undefined;
}

function getCurrentMachineDisk() {
  // var disk = machines.filter(
  //   (machine) => machine.name == getActualMachineName()
  // )[0]["disk"];
  var lastSession = sessions[sessions.length - 1];
  if (lastSession.user != -1) return machines[lastSession.machine].disk;
  else return undefined;
}

function getCurrentUser() {
  // var users = machines.filter(
  //   (machine) => machine.name == getActualMachineName()
  // )[0]["users"];
  // var user = users.filter((user) => user.name == getActualUserName())[0];
  var lastSession = sessions[sessions.length - 1];
  if (lastSession.user != -1)
    return machines[lastSession.machine].users[lastSession.user];
  else return undefined;
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
        permissions: "340",
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
        archive: "suVeneno_mp3Free.mp3",
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
        archive: "lamento_boliviano2.mp3",
        create_date: "2020-10-10 18:20",
        permissions: "320",
        owner: "1000",
        gowner: "1000",
      },
      {
        archive: "parcial_2.pdf",
        create_date: "2020-09-10 22:20",
        permissions: "320",
        owner: "1001",
        gowner: "1001",
      },
      {
        archive: "maquina_compartida2.pdf",
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
