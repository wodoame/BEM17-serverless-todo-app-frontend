import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, Loader2Icon, CircleAlertIcon } from "lucide-react"
import { useAuth } from "@/lib/use-auth"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Mode = "sign-in" | "sign-up"

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-[30px] w-[30px] flex-col justify-center gap-[2.5px] rounded-lg bg-[#FF5A00] p-[7px] shadow-[0_6px_16px_-4px_rgba(255,90,0,.5)]">
        <span className="block h-[2.5px] w-full rounded-sm bg-white" />
        <span className="block h-[2.5px] w-[68%] rounded-sm bg-white" />
        <span className="block h-[2.5px] w-full rounded-sm bg-white" />
      </div>
      <span className="text-xl font-extrabold tracking-[-0.02em] text-[#08283B] dark:text-[#F1F4F6]">
        Fleeting
      </span>
    </div>
  )
}

export default function SignIn() {
  const [mode, setMode] = useState<Mode>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  const isSignIn = mode === "sign-in"

  function switchMode(next: Mode) {
    setMode(next)
    setEmailError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!EMAIL_RE.test(email)) {
      setEmailError("Enter a valid email address.")
      return
    }
    setEmailError(null)
    setIsSubmitting(true)

    try {
      if (isSignIn) {
        await auth.signIn(email, password)
      } else {
        await auth.signUp(email, password)
      }
      navigate("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputBase =
    "h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-[#08283B] outline-none transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.30,1)] placeholder:text-gray-400 dark:bg-[#0b1826] dark:text-[#EAEEF0]"

  const inputFocusNormal =
    "border-gray-300 focus:border-[#FF5A00] focus:shadow-[0_0_0_2px_#fff,0_0_0_4px_rgba(255,90,0,.4)] dark:border-white/[0.12] dark:focus:border-[#FF5A00] dark:focus:shadow-[0_0_0_2px_#0f1e2b,0_0_0_4px_rgba(255,90,0,.45)]"

  const inputFocusError =
    "border-[#E02424] bg-[#FEFAFA] focus:border-[#E02424] focus:shadow-[0_0_0_2px_#fff,0_0_0_4px_rgba(224,36,36,.4)] dark:bg-[#0b1826] dark:focus:shadow-[0_0_0_2px_#0f1e2b,0_0_0_4px_rgba(224,36,36,.45)]"

  return (
    <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_30%_0%,#F0F1F3,#E4E6E8)] p-6 dark:bg-[radial-gradient(circle_at_30%_0%,#0f2033,#0a1620)]">
      <div className="w-full max-w-[400px] rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_18px_40px_-14px_rgba(8,40,59,.18)] dark:border-white/10 dark:bg-[#0f1e2b] dark:shadow-[0_20px_44px_-14px_rgba(0,0,0,.6)]">
        <div className="mb-6">
          <Logo />
        </div>

        <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em] text-[#08283B] dark:text-[#EAEEF0]">
          {isSignIn ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mb-5 text-sm text-gray-500 dark:text-[#8D9CA5]">
          {isSignIn
            ? "Sign in to pick up where you left off."
            : "Start capturing tasks in seconds, no email verification."}
        </p>

        {/* Mode toggle */}
        <div className="mb-5 flex w-full rounded-[10px] border border-gray-200 bg-gray-100 p-1 dark:border-white/[0.08] dark:bg-[#0b1826]">
          {(["sign-in", "sign-up"] as const).map((value) => {
            const active = value === mode
            return (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className={
                  "flex-1 rounded-md py-2 text-center text-sm font-semibold transition-colors " +
                  (active
                    ? "bg-white text-[#08283B] shadow-sm dark:bg-[#17293a] dark:text-[#EAEEF0]"
                    : "text-gray-500 hover:text-[#08283B] dark:text-[#7E8B94] dark:hover:text-[#EAEEF0]")
                }
              >
                {value === "sign-in" ? "Sign in" : "Sign up"}
              </button>
            )
          })}
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[13px] font-semibold text-gray-700 dark:text-[#C5D0D7]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (emailError) setEmailError(null)
              }}
              aria-invalid={emailError ? true : undefined}
              className={inputBase + " " + (emailError ? inputFocusError : inputFocusNormal)}
            />
            {emailError && (
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-medium text-[#C81E1E] dark:text-[#F98080]">
                <CircleAlertIcon className="h-3.5 w-3.5" />
                {emailError}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[13px] font-semibold text-gray-700 dark:text-[#C5D0D7]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputBase + " " + inputFocusNormal + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-[17px] w-[17px]" />
                ) : (
                  <EyeIcon className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
            {!isSignIn && (
              <p className="text-xs text-gray-400 dark:text-[#64798a]">Use at least 8 characters.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#08283B] text-sm font-semibold text-white transition-colors hover:bg-[#072436] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#FDFDFD] dark:text-[#08283B] dark:hover:bg-[#E6EAEB]"
          >
            {isSubmitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isSignIn
                ? "Signing in…"
                : "Creating account…"
              : isSignIn
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-[18px] text-center text-[13px] text-gray-500 dark:text-[#8D9CA5]">
          {isSignIn ? "New to Fleeting? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(isSignIn ? "sign-up" : "sign-in")}
            className="font-semibold text-[#08283B] hover:underline dark:text-[#CDE6FC]"
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}
