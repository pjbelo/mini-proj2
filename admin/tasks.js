const urlBase = "https://fcawebbook.herokuapp.com";
let isNew = true;

window.onload = () => {
  // References to HTML objects
  const tblTasks = document.getElementById("tblTasks");
  const frmTask = document.getElementById("frmTask");

  frmTask.addEventListener("submit", async (event) => {
    event.preventDefault();
    const txtTask = document.getElementById("txtTask").value;
    const txtStatus = document.getElementById("txtStatus").value;
    const txtVolunteer = document.getElementById("txtVolunteer").value;
    const txtStartDate = document.getElementById("txtStartDate").value;
    const txtEndDate = document.getElementById("txtEndDate").value;
    const txtDuration = document.getElementById("txtDuration").value;
    const txtDescription = document.getElementById("txtDescription").value;
    const txtTaskId = document.getElementById("txtTaskId").value;

    // Verifica flag isNew para saber se se trata de uma adição ou de um atualização dos dados de um membro
    let response;
    if (isNew) {
      // Adiciona Membro
      response = await fetch(`${urlBase}/tasks`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: `task=${txtTask}&status=${txtStatus}&volunteer=${txtVolunteer}&startDate=${txtStartDate}&endDate=${txtEndDate}&duration=${txtDuration}&description=${txtDescription}&active=1`,
      });
      const newTaskId = response.headers.get("Location");
      const newTask = await response.json();
      // Associa membro à conferência WebConfernce
      const newUrl = `${urlBase}/conferences/1/tasks/${newTaskId}`;
      const response2 = await fetch(newUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
      const newTask2 = await response2.json();
    } else {
      // Atualiza Membro
      response = await fetch(`${urlBase}/tasks/${txtTaskId}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "PUT",
        body: `task=${txtTask}&status=${txtStatus}&volunteer=${txtVolunteer}&startDate=${txtStartDate}&endDate=${txtEndDate}&duration=${txtDuration}&description=${txtDescription}&active=1`,
      });

      const newTask = await response.json();
    }
    isNew = true;
    renderTasks();
  });

  const renderTasks = async () => {
    frmTask.reset();
    let strHtml = `
            <thead>
                <tr class='bg-info'>
                    <th scope="col">#</th>
                    <th scope="col">Tarefa</th>
                    <th scope="col">Alocada a</th>
                    <th scope="col">Início</th>
                    <th scope="col">Estado</th>
                    <th scope="col" class="text-center">Editar | Apagar</th>
                </tr> 
            </thead>
            <tbody>
        `;

    // para ligar ao backoffice
    // const response = await fetch(`${urlBase}/conferences/1/tasks`);
    // const tasks = await response.json();

    const tasks = [
      {
        idTask: 1,
        task: "Apoiar inscrições",
        status: "Por iniciar",
        volunteer: "José Manuel",
        startDate: "2020-01-10",
        endDate: "2020-01-18",
        duration: "16",
        description: "Controlar inscrições e dar apoio email",
      },
      {
        idTask: 2,
        task: "Apoiar apresentadores",
        status: "Por iniciar",
        volunteer: "João José",
        startDate: "2020-01-12",
        endDate: "2020-01-14",
        duration: "8",
        description: "Dar apoio aos apresentadores",
      },
    ];

    let i = 1;
    for (const task of tasks) {
      strHtml += `
                <tr>
                    <td>${i}</td>
                    <td>${task.task}</td>
                    <td>${task.volunteer}</td>
                    <td>${task.startDate}</td>
                    <td>${task.status}</td>
                    <td class="text-center">
                        <i id='${task.idTask}' class='fas fa-edit edit'></i> |
                        <i id='${task.idTask}' class='fas fa-trash-alt remove'></i>
                    </td>
                </tr>
            `;
      i++;
    }
    strHtml += "</tbody>";
    tblTasks.innerHTML = strHtml;

    // Gerir o clique no ícone de Editar
    const btnEdit = document.getElementsByClassName("edit");
    for (let i = 0; i < btnEdit.length; i++) {
      btnEdit[i].addEventListener("click", () => {
        isNew = false;

        for (const task of tasks) {
          if (task.idTask == btnEdit[i].getAttribute("id")) {
            document.getElementById("txtTaskId").value = task.idTask;
            document.getElementById("txtTask").value = task.task;
            document.getElementById("txtStatus").value = task.status;
            document.getElementById("txtVolunteer").value = task.volunteer;
            document.getElementById("txtStartDate").value = task.startDate;
            document.getElementById("txtEndDate").value = task.endDate;
            document.getElementById("txtDuration").value = task.duration;
            document.getElementById("txtDescription").value = task.description;
          }
        }
      });
    }

    // Gerir o clique no ícone de Remover
    const btnDelete = document.getElementsByClassName("remove");
    for (let i = 0; i < btnDelete.length; i++) {
      btnDelete[i].addEventListener("click", () => {
        swal({
          title: "Tem a certeza?",
          text: "Não será possível reverter a remoção!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          cancelButtonText: "Cancelar",
          confirmButtonText: "Remover",
        }).then(async (result) => {
          if (result.value) {
            let taskId = btnDelete[i].getAttribute("id");
            try {
              const response = await fetch(
                `${urlBase}/conferences/1/tasks/${taskId}`,
                {
                  method: "DELETE",
                }
              );
              if (response.status == 204) {
                swal(
                  "Removido!",
                  "A tarefa foi removida da Conferência.",
                  "success"
                );
              }
            } catch (err) {
              swal({
                type: "error",
                title: "Erro",
                text: err,
              });
            }
            renderTasks();
          }
        });
      });
    }
  };
  renderTasks();
};
