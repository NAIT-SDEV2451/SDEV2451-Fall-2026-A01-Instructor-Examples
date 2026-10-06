// let's create the api functions here with our apiclient

import apiClient from "./client";

export async function loginUser({username, password}) {
  // remember that our apiCLient enhances the fetch.
  return apiClient('/auth/login/', {
    method: "POST",
    body: JSON.stringify({username, password})
  })
}

export async function registerUser({username, password, email, role}) {
  // remember that our apiCLient enhances the fetch.
  return apiClient('/auth/register/', {
    method: "POST",
    body: JSON.stringify({username, password, email, role})
  })
}

export async function refresh({refresh}) {
  // remember that our apiCLient enhances the fetch.
  return apiClient('/auth/token/refresh/', {
    method: "POST",
    body: JSON.stringify({refresh})
  })
}

export async function me() {
  // remember that our apiCLient enhances the fetch.
  return apiClient('/auth/me/')
}