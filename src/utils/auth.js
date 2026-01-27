export function register(role, data) {
  localStorage.setItem("user", JSON.stringify({ role, ...data }))
}

export function login(role, email, password) {
  const user = JSON.parse(localStorage.getItem("user"))
  if (!user) return false
  return user.email === email && user.password === password
}

export function isLoggedIn() {
  return !!localStorage.getItem("user")
}

export function logout() {
  localStorage.removeItem("user")
}
