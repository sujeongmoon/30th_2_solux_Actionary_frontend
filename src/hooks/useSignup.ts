import { useState } from "react";
import { signup } from "../api/auth";
import type { SignupResponse } from "../api/auth";


export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signupUser = async (body: FormData) : Promise<SignupResponse> => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await signup(body);
      return result;
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ?? "회원가입 중 오류가 발생했습니다."
      );
      throw error;
    } finally {
        setIsLoading(false);
    }
  };

  return { signupUser, isLoading, errorMessage };
};
