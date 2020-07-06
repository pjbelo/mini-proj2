const urlProd = "https://mini-proj3-pjbelo.herokuapp.com";
const urlDev = "http://localhost:8080";
const urlBase = urlDev;
let isNew = true;

window.onload = () => {
  // References to HTML objects
  const tblSponsors = document.getElementById("tblSponsors");
  const frmSponsor = document.getElementById("frmSponsor");

  frmSponsor.addEventListener("submit", async (event) => {
    event.preventDefault();
    const txtName = document.getElementById("txtName").value;
    const txtJob = document.getElementById("txtJob").value;
    const txtPhoto = document.getElementById("txtPhoto").value;
    const txtFacebook = document.getElementById("txtFacebook").value;
    const txtTwitter = document.getElementById("txtTwitter").value;
    const txtLinkedin = document.getElementById("txtLinkedin").value;
    const txtBio = document.getElementById("txtBio").value;
    const txtSponsorId = document.getElementById("txtSponsorId").value;

    // Verifica flag isNew para saber se se trata de uma adição ou de um atualização dos dados de um patrocinador
    let response;
    if (isNew) {
      // Adiciona Patrocinador
      response = await fetch(`${urlBase}/sponsors`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: `nome=${txtName}&cargo=${txtJob}&foto=${txtPhoto}&facebook=${txtFacebook}&twitter=${txtTwitter}&linkedin=${txtLinkedin}&bio=${txtBio}&active=1`,
      });
      const newSponsorId = response.headers.get("Location");
      const newSponsor = await response.json();
      // Associa patrocinador à conferência WebConfernce
      const newUrl = `${urlBase}/conferences/1/sponsors/${newSponsorId}`;
      const response2 = await fetch(newUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });
      const newSponsor2 = await response2.json();
    } else {
      // Atualiza Patrocinador
      response = await fetch(`${urlBase}/sponsors/${txtSponsorId}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "PUT",
        body: `nome=${txtName}&cargo=${txtJob}&foto=${txtPhoto}&facebook=${txtFacebook}&twitter=${txtTwitter}&linkedin=${txtLinkedin}&bio=${txtBio}&active=1`,
      });

      const newSponsor = await response.json();
    }
    isNew = true;
    renderSponsors();
  });

  const renderSponsors = async () => {
    frmSponsor.reset();
    let strHtml = `
            <thead >
                <tr><th class='w-100 text-center bg-warning' colspan='4'>Lista de Patrocinadores</th></tr>
                <tr class='bg-info'>
                    <th class='w-2'>#</th>
                    <th class='w-50'>Nome</th>
                    <th class='w-38'>Categoria</th>              
                    <th class='w-10 text-center'>Editar | Apagar</th>  
                </tr> 
            </thead><tbody>
        `;
    const response = await fetch(`${urlBase}/conferences/1/sponsors`);
    const sponsors = await response.json();
    let i = 1;
    for (const sponsor of sponsors) {
      strHtml += `
                <tr>
                    <td>${i}</td>
                    <td>${sponsor.nome}</td>
                    <td>${sponsor.categoria}</td>
                    <td class="text-center">
                        <i id='${sponsor.idSponsor}' class='fas fa-edit edit'></i>
                           |    
                        <i id='${sponsor.idSponsor}' class='fas fa-trash-alt remove'></i>
                    </td>
                </tr>
            `;
      i++;
    }
    strHtml += "</tbody>";
    tblSponsors.innerHTML = strHtml;

    // Gerir o clique no ícone de Editar
    const btnEdit = document.getElementsByClassName("edit");
    for (let i = 0; i < btnEdit.length; i++) {
      btnEdit[i].addEventListener("click", () => {
        isNew = false;
        for (const sponsor of sponsors) {
          if (sponsor.idSponsor == btnEdit[i].getAttribute("id")) {
            document.getElementById("txtSponsorId").value = sponsor.idSponsor;
            document.getElementById("txtName").value = sponsor.nome;
            document.getElementById("txtLogo").value = sponsor.logo;
            document.getElementById("txtCategory").value = sponsor.categoria;
            document.getElementById("txtLink").value = sponsor.link;
            document.getElementById("txtActive").value = sponsor.active;
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
            let sponsorId = btnDelete[i].getAttribute("id");
            try {
              const response = await fetch(
                `${urlBase}/conferences/1/sponsors/${sponsorId}`,
                {
                  method: "DELETE",
                }
              );
              if (response.status == 204) {
                swal(
                  "Removido!",
                  "O patrocinador foi removido da Conferência.",
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
            renderSponsors();
          }
        });
      });
    }
  };
  renderSponsors();
};
