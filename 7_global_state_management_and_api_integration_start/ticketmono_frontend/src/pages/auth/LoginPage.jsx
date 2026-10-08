import { useNavigate } from "react-router-dom"
import LoginForm from "../../components/LoginForm"
import { useAuth } from "../../hooks/useAuth"


function LoginPage() {
  const {
    login,
    isLoggingIn,
    loginError
  } = useAuth()
  const navigate = useNavigate()

  const submit = (formData) => {
    console.log("login submitted", formData)
    // remember here that login is a
    // react query mutation
    login(formData, {
      onSuccess: () => {
        navigate('/')
      }
    })
  }


  return (
    <div className="flex justify-center mt-12">
      <div className="card bg-base-100 shadow w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-2">Log In</h2>
          <LoginForm onSubmit={submit} />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
