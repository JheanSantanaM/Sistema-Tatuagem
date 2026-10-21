const API = 'http://127.0.0.1:8000'

protegerPagina()

const formSenioridade = document.getElementById('form-senioridade')
const botaoSubmit = document.getElementById('btn-submit-senioridade')

function limparFormulario() {
  formSenioridade.reset()
  delete formSenioridade.dataset.idSenioridade

  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

async function listarSenioridades() {
  const resposta = await fetchAutenticado(`${API}/senioridade`)

  if (!resposta.ok) {
    alert('Erro ao carregar senioridades.')
    return
  }

  const senioridades = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  senioridades.forEach(s => {
    corpo.innerHTML += `
      <tr>
        <td>${s.idsenioridade}</td>
        <td>${s.nome}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2"
            onclick='preencherFormularioEdicao(${JSON.stringify(s)})'>
            Editar
          </button>

          <button class="btn btn-sm btn-danger"
            onclick="deletarSenioridade(${s.idsenioridade})">
            Excluir
          </button>
        </td>
      </tr>
    `
  })
}

listarSenioridades()

formSenioridade.addEventListener('submit', async (e) => {
  e.preventDefault()

  const senioridade = {
    nome: document.getElementById('nome').value
  }

  const idSenioridade = formSenioridade.dataset.idSenioridade

  let resposta

  if (idSenioridade) {
    resposta = await fetchAutenticado(`${API}/senioridade/${idSenioridade}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(senioridade)
    })
  } else {
    resposta = await fetchAutenticado(`${API}/senioridade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(senioridade)
    })
  }

  if (!resposta.ok) {
    alert('Erro ao salvar senioridade.')
    return
  }

  alert(idSenioridade ? 'Senioridade atualizada!' : 'Senioridade cadastrada!')

  limparFormulario()
  listarSenioridades()
})

function preencherFormularioEdicao(senioridade) {
  document.getElementById('nome').value = senioridade.nome

  formSenioridade.dataset.idSenioridade = senioridade.idsenioridade

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

async function deletarSenioridade(id) {
  if (!confirm('Tem certeza que deseja excluir esta senioridade?')) return

  const resposta = await fetchAutenticado(`${API}/senioridade/${id}`, {
    method: 'DELETE'
  })

  if (!resposta.ok) {
    alert('Não foi possível excluir a senioridade.')
    return
  }

  listarSenioridades()
}