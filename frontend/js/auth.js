
function protegerPagina() {
  const token = localStorage.getItem('token')

  if (!token) {
    window.location.href = 'login.html'
  }
}

async function fetchAutenticado(url, opcoes = {}) {
  const token = localStorage.getItem('token')

  const headers = new Headers(opcoes.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const resposta = await fetch(url, {
    ...opcoes,
    headers
  })

  if (resposta.status === 401) {
    localStorage.removeItem('token')
    window.location.href = 'login.html'
  }

  return resposta
}

function sair() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}