import { describe, it, test, expect, vi, beforeEach, afterEach } from "vitest";

import { screen, waitFor } from "@testing-library/react";

// we're going to be triggering user events here so we need to import
// the user events.
import userEvent from "@testing-library/user-event";

// we're going to also mock an api error in the tests
import {http, HttpResponse} from 'msw'

import LoginPage from "../pages/auth/LoginPage";
import { renderWithProviders } from "../test/renderWithProviders";
import { server } from "../test/server";


// let's talk some about mocks.
// docs: https://vitest.dev/guide/mocking
// we've already created the mocks for our server with msw and
// the backend is an external dependency.
// in the login we have "useNavigate"
// create a mocks we are going overwrite the response of
// use navigate to a function we control!
const mockNavigate = vi.fn()

// we need to replace mockNavigate as the return value of
// react-router-dom's useNavigate function
vi.mock('react-router-dom', async (importOriginal) => {
  // the actual package.
  const actual = await importOriginal()

  // return an object with the actual but also
  // our mock from useNavigate
  return {
    ...actual, // the actual package.
    useNavigate: () => mockNavigate
  }
})

describe("LoginPage", () => {
  // setup the user event
  const user = userEvent.setup()

  // clear the mock before each test
  beforeEach(()=> {
    mockNavigate.mockClear()
    // this resets our mock to nothing (what we want)
    // before each test.
  })

  // clear up the tokens of local storage after each test
  afterEach(()=> {
    localStorage.clear() // make sure the next test isn't
    // polluted by the previous test.
  })

  // successful login
  it("navigates to the home page after a successful login", async ()=> {
    // go to the page, go to the page somehow.
    renderWithProviders(<LoginPage />)
    // type in the credentials/ username and password
    const usernameInput = screen.getByPlaceholderText(
      "Enter your username"
    )
    const passwordInput = screen.getByPlaceholderText(
      "Enter your password"
    )
    // let's actually type remember user is userEvent.setup() above.
    await user.type(usernameInput, "gary")
    await user.type(passwordInput, "supersecretcoolpasswordlolkeeptypinglol")


    // click or execture login
    await user.click(screen.getByRole("button", {name: "Log In"}))

    // if navigate gets called then our login is successful
    // this is where our mock comes in!
    // we're going to check that our mockNavigate
    // to be called with the arg "/"
    await waitFor(()=> {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })


  // unsuccessful login.

})


