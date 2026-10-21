const API = 'http://127.0.0.1:8000'

protegerPagina()

const formAgendamento = document.getElementById('form-agendamento')
const botaoSubmit = document.getElementById('btn-submit-agendamento')
const blocoStatus = document.getElementById('bloco-status')

function limparFormulario() {
  formAgendamento.reset()
  delete formAgendamento.dataset.idAgendamento

  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')

  blocoStatus.style.display = 'none'
}

async function carregarClientes() {
  const resposta = await fetchAutenticado(`${API}/clientes`)

  if (!resposta.ok) {
    alert('Erro ao carregar clientes.')
    return
  }

  const clientes = await resposta.json()

  const select = document.getElementById('idcliente')

  select.innerHTML = '<option value="">Cliente...</option>'

  clientes.forEach(c => {
    select.innerHTML += `
      <option value="${c.idcliente}">
        ${c.nome}
      </option>
    `
  })
}

async function carregarTatuadores() {
  const resposta = await fetchAutenticado(`${API}/tatuadores`)

  if (!resposta.ok) {
    alert('Erro ao carregar tatuadores.')
    return
  }

  const tatuadores = await resposta.json()

  const select = document.getElementById('idtatuador')

  select.innerHTML = '<option value="">Tatuador...</option>'

  tatuadores.forEach(t => {
    select.innerHTML += `
      <option value="${t.idtatuador}">
        ${t.nometatuador}
      </option>
    `
  })
}

async function listarAgendamentos() {
  const resposta = await fetchAutenticado(`${API}/agendamentos`)

  if (!resposta.ok) {
    alert('Erro ao carregar agendamentos.')
    return
  }

  const agendamentos = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  agendamentos.forEach(a => {
    const imagemHtml = a.desenhoaprovado
      ? `<img src="${API}/uploads/${a.desenhoaprovado}"
          style="max-width: 60px; max-height: 60px;">`
      : '-'

    corpo.innerHTML += `
      <tr>
        <td>${a.idagendamento}</td>
        <td>${a.cliente}</td>
        <td>${a.tatuador}</td>
        <td>${a.dataagendamento}</td>
        <td>${a.horaagendamento}</td>
        <td>${a.valortatuagem ?? '-'}</td>
        <td>${a.status}</td>
        <td>${imagemHtml}</td>

        <td>
          <button
            class="btn btn-sm btn-warning me-2"
            onclick='preencherFormularioEdicao(${JSON.stringify(a)})'>
            Editar
          </button>

          <button
            class="btn btn-sm btn-danger"
            onclick="deletarAgendamento(${a.idagendamento})">
            Excluir
          </button>
        </td>
      </tr>
    `
  })
}

carregarClientes()
carregarTatuadores()
listarAgendamentos()

formAgendamento.addEventListener('submit', async (e) => {
  e.preventDefault()

  const agendamento = {
    idcliente: Number(document.getElementById('idcliente').value),
    idtatuador: Number(document.getElementById('idtatuador').value),
    dataagendamento: document.getElementById('dataagendamento').value,
    horaagendamento: document.getElementById('horaagendamento').value,
    descricaotatuagem:
      document.getElementById('descricaotatuagem').value || null,
    valortatuagem:
      document.getElementById('valortatuagem').value
        ? Number(document.getElementById('valortatuagem').value)
        : null,
    status: document.getElementById('status').value
  }

  const idAgendamento = formAgendamento.dataset.idAgendamento

  let idParaUpload = idAgendamento

  let resposta

  if (idAgendamento) {
    resposta = await fetchAutenticado(
      `${API}/agendamentos/${idAgendamento}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agendamento)
      }
    )
  } else {
    resposta = await fetchAutenticado(`${API}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(agendamento)
    })

    if (resposta.ok) {
      const dados = await resposta.json()
      idParaUpload = dados.idagendamento
    }
  }

  if (!resposta.ok) {
    const erro = await resposta.json()
    alert('Erro ao salvar agendamento: ' + JSON.stringify(erro))
    return
  }

  const arquivo = document.getElementById('desenho').files[0]

  if (arquivo && idParaUpload) {
    const formData = new FormData()

    formData.append('arquivo', arquivo)

    const respostaUpload = await fetchAutenticado(
      `${API}/agendamentos/${idParaUpload}/desenho`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!respostaUpload.ok) {
      alert('Agendamento salvo, mas houve erro ao enviar a imagem.')
    }
  }

  alert(idAgendamento
    ? 'Agendamento atualizado!'
    : 'Agendamento cadastrado!'
  )

  limparFormulario()
  listarAgendamentos()
})

async function deletarAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

  const resposta = await fetchAutenticado(
    `${API}/agendamentos/${id}`,
    {
      method: 'DELETE'
    }
  )

  if (!resposta.ok) {
    alert('Não foi possível excluir o agendamento.')
    return
  }

  listarAgendamentos()
}

function preencherFormularioEdicao(agendamento) {
  document.getElementById('idcliente').value = agendamento.idcliente
  document.getElementById('idtatuador').value = agendamento.idtatuador
  document.getElementById('dataagendamento').value =
    agendamento.dataagendamento
  document.getElementById('horaagendamento').value =
    agendamento.horaagendamento
  document.getElementById('descricaotatuagem').value =
    agendamento.descricaotatuagem || ''
  document.getElementById('valortatuagem').value =
    agendamento.valortatuagem || ''
  document.getElementById('status').value =
    agendamento.status || 'pendente'

  formAgendamento.dataset.idAgendamento = agendamento.idagendamento

  blocoStatus.style.display = 'block'

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}