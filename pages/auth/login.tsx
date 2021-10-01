import { getCsrfToken, signIn } from "next-auth/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { ErrorCode, getSession } from "@lib/auth";

import Loader from "@components/Loader";
import { HeadSeo } from "@components/seo/head-seo";

const errorMessages: { [key: string]: string } = {
  [ErrorCode.SecondFactorRequired]:
    "Two-factor authentication enabled. Please enter the six-digit code from your authenticator app.",
  [ErrorCode.IncorrectPassword]: "Password is incorrect. Please try again.",
  [ErrorCode.UserNotFound]: "No account exists matching that email address.",
  [ErrorCode.IncorrectTwoFactorCode]: "Two-factor code is incorrect. Please try again.",
  [ErrorCode.InternalServerError]:
    "Something went wrong. Please try again and contact us if the issue persists.",
};

export default function Login({ csrfToken }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondFactorRequired, setSecondFactorRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callbackUrl = typeof router.query?.callbackUrl === "string" ? router.query.callbackUrl : "/";

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
        totpCode: code,
        callbackUrl,
      });
      if (!response) {
        console.error("Received empty response from next auth");
        return;
      }

      if (!response.error) {
        router.replace(callbackUrl);
        return;
      }

      if (response.error === ErrorCode.SecondFactorRequired) {
        setSecondFactorRequired(true);
        setErrorMessage(errorMessages[ErrorCode.SecondFactorRequired]);
      } else {
        setErrorMessage(errorMessages[response.error] || "Something went wrong.");
      }
    } catch (e) {
      setErrorMessage("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-neutral-50 sm:px-6 lg:px-8">
      <HeadSeo title="Login" description="Login" />

      {isSubmitting && (
        <div className="absolute z-50 flex items-center w-full h-screen bg-gray-50">
          <Loader />
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="h-6 mx-auto" src="/calendso-logo-white-word.svg" alt="Cal.com Logo" />
        <h2 className="mt-6 text-3xl font-bold text-center font-cal text-neutral-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 mx-2 bg-white border rounded-sm sm:px-10 border-neutral-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} hidden />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border rounded-sm shadow-sm appearance-none border-neutral-300 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex">
                <div className="w-1/2">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    Password
                  </label>
                </div>
                <div className="w-1/2 text-right">
                  <Link href="/auth/forgot-password">
                    <a tabIndex={-1} className="text-sm font-medium text-primary-600">
                      Forgot?
                    </a>
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border rounded-sm shadow-sm appearance-none border-neutral-300 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                />
              </div>
            </div>

            {secondFactorRequired && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                  Two-Factor Code
                </label>
                <div className="mt-1">
                  <input
                    id="totpCode"
                    name="totpCode"
                    type="text"
                    maxLength={6}
                    minLength={6}
                    inputMode="numeric"
                    value={code}
                    onInput={(e) => setCode(e.currentTarget.value)}
                    className="block w-full px-3 py-2 placeholder-gray-400 border rounded-sm shadow-sm appearance-none border-neutral-300 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-sm shadow-sm bg-neutral-900 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                Sign in
              </button>
            </div>

            {errorMessage && <p className="mt-1 text-sm text-red-700">{errorMessage}</p>}
          </form>
        </div>
        <div className="mt-4 text-sm text-center text-neutral-600">
          Don&apos;t have an account? {/* replace this with your account creation flow */}
          <a href="/auth/signup" className="font-medium text-neutral-900">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}

Login.getInitialProps = async (context) => {
  const { req, res } = context;
  const session = await getSession({ req });

  if (session) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  return {
    csrfToken: await getCsrfToken(context),
  };
};
