import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Label,
} from "devnote/modules/shared/ui";
import { useAuthCard } from "./use-auth-card";
import { AuthCardTabsType } from "./types";

export const AuthCard = () => {
  const {
    activeTab,
    setActiveTab,
    username,
    password,
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
  } = useAuthCard();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">DevNote</CardTitle>
        <CardDescription>Write It, Share It, Own It</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AuthCardTabsType)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="dev@example.com"
                    required
                    value={username}
                    type="email"
                    onChange={handleUsernameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    required
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  loading={isLoadingLogin}
                >
                  Login
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Your name"
                    required
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    placeholder="dev@example.com"
                    required
                    type="email"
                    value={signupEmail}
                    onChange={handleSignupEmailChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    required
                    type="password"
                    value={signupPassword}
                    onChange={handleSignupPasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                </div>
                <Button className="w-full" type="submit" loading={isLoadingSignup}>
                  Sign Up
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
