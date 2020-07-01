const urlBase = "https://mini-proj3-pjbelo.herokuapp.com";
let isNew = true;

window.onload = () => {
  // References to HTML objects
  const tblCcmembers = document.getElementById("tblCcmembers");
  const frmCcmember = document.getElementById("frmCcmember");

  frmCcmember.addEventListener("submit", async (event) => {
    event.preventDefault();
    const txtName = document.getElementById("txtName").value;
    const txtJob = document.getElementById("txtJob").value;
    const txtPhoto = document.getElementById("txtPhoto").value;
    const txtFacebook = document.getElementById("txtFacebook").value;
    const txtTwitter = document.getElementById("txtTwitter").value;
    const txtLinkedin = document.getElementById("txtLinkedin").value;
    const txtBio = document.getElementById("txtBio").value;
    const txtCcmemberId = document.getElementById("txtCcmemberId").value;

    // Verifica flag isNew para saber se se trata de uma adição ou de um atualização dos dados de um membro
    let response;
    if (isNew) {
      // Adiciona Membro
      response = await fetch(`${urlBase}/ccmembers`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: `nome=${txtName}&cargo=${txtJob}&foto=${txtPhoto}&facebook=${txtFacebook}&twitter=${txtTwitter}&linkedin=${txtLinkedin}&bio=${txtBio}&active=1`,
      });
      const newCcmemberId = response.headers.get("Location");
      const newCcmember = await response.json();
      // Associa membro à conferência WebConfernce
      const newUrl = `${urlBase}/conferences/1/ccmembers/${newCcmemberId}`;
      const response2 = await fetch(newUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
      const newCcmember2 = await response2.json();
    } else {
      // Atualiza Membro
      response = await fetch(`${urlBase}/ccmembers/${txtCcmemberId}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "PUT",
        body: `nome=${txtName}&cargo=${txtJob}&foto=${txtPhoto}&facebook=${txtFacebook}&twitter=${txtTwitter}&linkedin=${txtLinkedin}&bio=${txtBio}&active=1`,
      });

      const newCcmember = await response.json();
    }
    isNew = true;
    renderCcmembers();
  });

  const renderCcmembers = async () => {
    frmCcmember.reset();
    let strHtml = `
            <thead >
                <tr><th class='w-100 text-center bg-warning' colspan='4'>Lista de Membros da Comissão Científica</th></tr>
                <tr class='bg-info'>
                    <th class='w-2'>#</th>
                    <th class='w-50'>Nome</th>
                    <th class='w-38'>Cargo</th>              
                    <th class='w-10 text-center'>Editar | Apagar</th>              
                </tr> 
            </thead><tbody>
        `;

    // para ligar ao backoffice
    // const response = await fetch(`${urlBase}/conferences/1/ccmembers`);
    // const ccmembers = await response.json();

    const ccmembers = [
      {
        idCcmember: 1,
        nome: "José Manuel",
        cargo: "Professor TIC",
        foto: "http://pics.com/25523",
        facebook: "",
        twitter: "",
        linkedin: "",
        bio: "Nasceu e viveu",
      },
      {
        idCcmember: 2,
        nome: "João Manuel",
        cargo: "Coordenador TIC",
        foto: "http://pics.com/21323",
        facebook: "",
        twitter: "",
        linkedin: "",
        bio: "Hakuna Matata",
      },
    ];

    let i = 1;
    for (const ccmember of ccmembers) {
      strHtml += `
                <tr>
                    <td>${i}</td>
                    <td>${ccmember.nome}</td>
                    <td>${ccmember.cargo}</td>
                    <td class="text-center">
                        <i id='${ccmember.idCcmember}' class='fas fa-edit edit'></i> | 
                        <i id='${ccmember.idCcmember}' class='fas fa-trash-alt remove'></i>
                    </td>
                </tr>
            `;
      i++;
    }
    strHtml += "</tbody>";
    tblCcmembers.innerHTML = strHtml;

    // Gerir o clique no ícone de Editar
    const btnEdit = document.getElementsByClassName("edit");
    for (let i = 0; i < btnEdit.length; i++) {
      btnEdit[i].addEventListener("click", () => {
        isNew = false;

        for (const ccmember of ccmembers) {
          if (ccmember.idCcmember == btnEdit[i].getAttribute("id")) {
            document.getElementById("txtCcmemberId").value =
              ccmember.idCcmember;
            document.getElementById("txtName").value = ccmember.nome;
            document.getElementById("txtJob").value = ccmember.cargo;
            document.getElementById("txtPhoto").value = ccmember.foto;
            document.getElementById("txtFacebook").value = ccmember.facebook;
            document.getElementById("txtTwitter").value = ccmember.twitter;
            document.getElementById("txtLinkedin").value = ccmember.linkedin;
            document.getElementById("txtBio").value = ccmember.bio;
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
            let ccmemberId = btnDelete[i].getAttribute("id");
            try {
              const response = await fetch(
                `${urlBase}/conferences/1/ccmembers/${ccmemberId}`,
                {
                  method: "DELETE",
                }
              );
              if (response.status == 204) {
                swal(
                  "Removido!",
                  "O membro foi removido da Conferência.",
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
            renderCcmembers();
          }
        });
      });
    }
  };
  renderCcmembers();
};
