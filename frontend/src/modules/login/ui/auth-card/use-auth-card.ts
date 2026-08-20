import { useAuthActions } from "devnote/modules/auth/hooks/use-auth-actions";
import { selectIsLoadingLogin, selectIsLoadingSignup } from "devnote/modules/auth/redux/selector/auth-selectors";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { AuthCardTabsType } from "./types";

export function useAuthCard() {
	const [activeTab, setActiveTab] = useState<AuthCardTabsType>("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { login, signup } = useAuthActions();
  const isLoadingLogin = useSelector(selectIsLoadingLogin);
  const isLoadingSignup = useSelector(selectIsLoadingSignup);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signup(name, signupEmail, signupPassword, confirmPassword);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSignupEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSignupEmail(e.target.value);
  };

  const handleSignupPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSignupPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

	return {
		activeTab,
		setActiveTab,
		username,
		setUsername,
		password,
		setPassword,
		handleLogin,
		handleUsernameChange,
		handlePasswordChange,
		isLoadingLogin,
		name,
		signupEmail,
		signupPassword,
		confirmPassword,
		isLoadingSignup,
		handleSignup,
		handleNameChange,
		handleSignupEmailChange,
		handleSignupPasswordChange,
		handleConfirmPasswordChange,
	};
}
