const urlProd = "https://mini-proj3-pjbelo.herokuapp.com";
const urlDev = "http://localhost:8080";
const urlBase = urlDev;
let isNew = true;
document.getElementById("btn_submit").innerText = "Criar Voluntário";

window.onload = () => {
  // References to HTML objects
  const tblVolunteers = document.getElementById("tblVolunteers");
  const frmVolunteer = document.getElementById("frmVolunteer");

  frmVolunteer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const txtName = document.getElementById("txtName").value;
    const txtJob = document.getElementById("txtJob").value;
    const txtPhone = document.getElementById("txtPhone").value;
    const txtEmail = document.getElementById("txtEmail").value;
    const txtPhoto = document.getElementById("txtPhoto").value;
    const txtVolunteerId = document.getElementById("txtVolunteerId").value;

    // Verifica flag isNew para saber se se trata de uma adição ou de um atualização dos dados de um voluntário
    let response;
    if (isNew) {
      // Adiciona Voluntário
      console.log("Create Volunteer");
      response = await fetch(`${urlBase}/volunteers`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: `name=${txtName}&job=${txtJob}&phone=${txtPhone}&email=${txtEmail}&photo=${txtPhoto}`,
      });
      const newVolunteerId = response.headers.get("Location");
      const newVolunteer = await response.json();
      // Associa voluntário à conferência WebConfernce
      const newUrl = `${urlBase}/conferences/1/volunteers/${newVolunteerId}`;
      const response2 = await fetch(newUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
      const newVolunteer2 = await response2.json();
    } else {
      // Atualiza Voluntário
      response = await fetch(`${urlBase}/volunteers/${txtVolunteerId}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "PUT",
        body: `name=${txtName}&job=${txtJob}&phone=${txtPhone}&email=${txtEmail}&photo=${txtPhoto}`,
      });

      const newVolunteer = await response.json();
    }
    isNew = true;
    renderVolunteers();
  });

  const renderVolunteers = async () => {
    frmVolunteer.reset();
    let strHtml = `
            <thead >
                <tr><th class='w-100 text-center bg-warning' colspan='4'>Lista de Voluntários</th></tr>
                <tr class='bg-info'>
                    <th class='w-2'>#</th>
                    <th class='w-50'>Nome</th>
                    <th class='w-38'>Cargo</th>              
                    <th class='w-10 text-center'>Editar | Apagar</th>              
                </tr> 
            </thead><tbody>
        `;
    const response = await fetch(`${urlBase}/conferences/1/volunteers`);
    const volunteers = await response.json();

    /*
    const volunteers = [
      {
        idVolunteer: 1,
        name: "João Paulo",
        job: "Responder emails",
        email: "email1@mail.com",
        phone: "123 456 789",
        photo: "http://pics.com/21323",
      },
      {
        idVolunteer: 2,
        name: "João Pedro",
        job: "Atendimento telefónico",
        email: "email22@mail.com",
        phone: "987 654 321",
        photo: "http://pics.com/24323",
      },
    ];
    */

    let i = 1;
    for (const volunteer of volunteers) {
      strHtml += `
                <tr>
                    <td>${i}</td>
                    <td>${volunteer.name}</td>
                    <td>${volunteer.job}</td>
                    <td class="text-center">
                        <i id='${volunteer.volunteer_id}' class='fas fa-edit edit'></i> | 
                        <i id='${volunteer.volunteer_id}' class='fas fa-trash-alt remove'></i>
                    </td>
                </tr>
            `;
      i++;
    }
    strHtml += "</tbody>";
    tblVolunteers.innerHTML = strHtml;

    // Gerir o clique no ícone de Editar
    const btnEdit = document.getElementsByClassName("edit");
    for (let i = 0; i < btnEdit.length; i++) {
      btnEdit[i].addEventListener("click", () => {
        isNew = false;
        document.getElementById("btn_submit").innerText =
          "Atualizar Voluntário";
        for (const volunteer of volunteers) {
          if (volunteer.volunteer_id == btnEdit[i].getAttribute("id")) {
            document.getElementById("txtVolunteerId").value =
              volunteer.volunteer_id;
            document.getElementById("txtName").value = volunteer.name;
            document.getElementById("txtJob").value = volunteer.job;
            document.getElementById("txtPhone").value = volunteer.phone;
            document.getElementById("txtEmail").value = volunteer.email;
            document.getElementById("txtPhoto").value = volunteer.photo;
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
            let volunteerId = btnDelete[i].getAttribute("id");
            try {
              const response = await fetch(
                `${urlBase}/conferences/1/volunteers/${volunteerId}`,
                {
                  method: "DELETE",
                }
              );
              if (response.status == 204) {
                swal(
                  "Removido!",
                  "O voluntário foi removido da Conferência.",
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
            renderVolunteers();
          }
        });
      });
    }
  };
  renderVolunteers();
};
