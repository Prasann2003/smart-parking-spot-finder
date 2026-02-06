// 🔹 REGISTER USER
export function register(data) {
  const existingUser = localStorage.getItem(data.email)
  if (existingUser) return false

  const userWithRole = {
    ...data,
    role: "driver", // ✅ default role
  }

  localStorage.setItem(data.email, JSON.stringify(userWithRole))
  return true
}


// 🔹 LOGIN USER
export function login(email, password) {
  const user = JSON.parse(localStorage.getItem(email))

  if (!user) return false
  if (user.password !== password) return false

  // store logged in session
  localStorage.setItem("currentUser", JSON.stringify(user))

  return true
}

// 🔹 CHECK IF LOGGED IN
export function isLoggedIn() {
  return !!localStorage.getItem("currentUser")
}

// 🔹 LOGOUT
export function logout() {
  localStorage.removeItem("currentUser")
}

// 🔹 GET CURRENT USER
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"))
}
