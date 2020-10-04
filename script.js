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
