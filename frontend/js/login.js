const API = 'http://127.0.0.1:8000'

const formLogin = document.getElementById('form-login')

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const senha = document.getElementById('senha').value

  try {
    const resposta = await fetch(`${API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    })

    const resultado = await resposta.json()

    console.log('Resposta da API:', resultado)

    if (resposta.ok && resultado.access_token) {
      localStorage.setItem('token', resultado.access_token)

      window.location.href = 'dashboard.html'
    } else {
      alert('Erro ao entrar: ' + (resultado.erro || 'E-mail ou senha incorretos.'))
    }

  } catch (erro) {
    console.error('Erro:', erro)

    alert(
      'Não foi possível conectar com a API.\n\n' +
      'Verifique se o servidor FastAPI está funcionando.'
    )
  }
})