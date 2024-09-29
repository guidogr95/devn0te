import { useAuthActions } from "devnote/modules/auth/hooks/use-auth-actions";
import { selectIsLoadingLogin } from "devnote/modules/auth/redux/selector/auth-selectors";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { AuthCardTabsType } from "./types";

export function useAuthCard() {
	const [activeTab, setActiveTab] = useState<AuthCardTabsType>("login");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login } = useAuthActions();
  const isLoadingLogin = useSelector(selectIsLoadingLogin);

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
		isLoadingLogin
	};
}
