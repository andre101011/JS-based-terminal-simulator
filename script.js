

const prepend="user@admin:~$ ";
const commandError='<span class="highlighted">Error: orden no encontrada</span>';
var acumPrompt="";
var lastCommand;


function searchCommand(command){

  command=command.split(' ');
  console.log(command)
    switch (command[0]) {
        case "Login":
          switch (command[1]) {
            case "andres":
              return "Jeje el usuario  existe :p";
              
            default:
              return "Ingrese el nombre del usuario";
              
          }
          break;
        case "comando2":
          command = "respuesta comando2";
          break;
        case "comando3":
          command = "respuesta comando3";
          break;
        case "":
          break;
        default:
          command =
            '<span class="highlighted">Error: orden no encontrada</span>';
          break;
      }
      return command;
}

function executeCommand(event){
  
  var prompt=document.getElementById('command').value;
  
  if(event.keyCode==13){

    var command=prompt.split('$')[1].trim();
    //console.log(command)
    if(command=='clear'){

      acumPrompt=' ';
      
    }else{
      
      var answer=searchCommand(command);

      acumPrompt+=prompt +'\n'+ answer+ '\n';

    }
    
    lastCommand=command; 
    document.getElementById('response-field').innerHTML=acumPrompt;
    document.getElementById('command').value=prepend;

  }
  
}


document.getElementById('command').value=prepend;

//$('#command').val('user@admin:~$ ');



/** 
$(document).ready(function () {
  var prepend = "user@admin:~$";
  $("#command")
    .focus()
    .val(prepend + " ");
  $(document).keypress(function (e) {
    //13 is the keycode for Enter
    if (e.which == 13) {
      var command = $("#command")
        .val()
        .replace("user@admin:~$ ", "")
        .trim()
        .replace(/(\r\n|\n|\r)/gm, "");
      var preCommand = command;
      command = command.split(" ");
      switch (command[0]) {
        case "Login:":
          switch (command[1]) {
            case "andres":
              command = "Jeje el usuario no existe :p";
              break;
            default:
              command = "Ingrese el nombre del usuario";
              break;
          }
          break;
        case "comando2":
          command = "respuesta comando2";
          break;
        case "comando3":
          command = "respuesta comando3";
          break;
        case "clear":
          command = "";
          $("#response-field").html("");
          break;
        case "":
          break;
        default:
          command =
            '<span class="highlighted">Error: orden no encontrada</span>';
          break;
      }
      $("#response-field").append(prepend + " " + preCommand + "\n");
      $("#response-field").append(prepend + " " + command + "\n");
      $("#command").val("user@admin:~$ ");
      return false;
    }
  });
});
*/