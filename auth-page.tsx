import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, registerSchema, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Form types
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handlers
  const onLoginSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    await registerMutation.mutateAsync(values);
  };

  // If user is already authenticated, redirect to the home page
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Left column: Authentication forms */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">DroneView Monitor</h1>
            <p className="text-neutral-500 mt-2">Sign in or create an account to access the system</p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} className="border-neutral-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} className="border-neutral-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700" disabled={isLoading}>
                        {isLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                        ) : (
                          'Sign in'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-neutral-500">
                    Test account: admin / password123
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-t-4 border-t-primary shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>Enter your information to register a new account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="user123" {...field} className="border-neutral-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} className="border-neutral-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} className="border-neutral-300" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700" disabled={isLoading}>
                        {isLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                        ) : (
                          'Create account'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column: Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/80 to-blue-700 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-3xl font-bold mb-6">Advanced DroneView Fleet Monitoring System</h2>
          <ul className="space-y-6">
            <li className="flex items-start">
              <div className="mr-4 bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <span className="font-medium block mb-1">Real-time Drone Monitoring</span>
                <span className="text-white/80 text-sm">Track drone status and telemetry data instantly</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <div>
                <span className="font-medium block mb-1">Component Diagnostics</span>
                <span className="text-white/80 text-sm">Monitor health status of all drone components and systems</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div>
                <span className="font-medium block mb-1">Intelligent Alert System</span>
                <span className="text-white/80 text-sm">Get notified about critical events and potential issues</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <div>
                <span className="font-medium block mb-1">Advanced Analytics</span>
                <span className="text-white/80 text-sm">Comprehensive telemetry data analysis and performance metrics</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}