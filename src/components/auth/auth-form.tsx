"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "../ui/separator";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type AuthFormProps = {
  mode: "login" | "signup";
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.45H18.02C17.67 15.93 16.74 17.2 15.31 18.12V20.84H19.5C21.49 19.01 22.56 16.43 22.56 13.25V12.25Z" fill="#4285F4"/>
        <path d="M12 23C14.97 23 17.45 22.02 19.5 20.44L15.31 17.72C14.33 18.39 13.23 18.75 12 18.75C9.37 18.75 7.14 17.06 6.24 14.81H2.03V17.62C4.01 21.09 7.74 23 12 23Z" fill="#34A853"/>
        <path d="M6.24 14.81C6.04 14.22 5.92 13.59 5.92 12.94C5.92 12.29 6.04 11.66 6.24 11.07V8.26H2.03C1.24 9.77 0.75 11.52 0.75 13.33C0.75 15.14 1.24 16.89 2.03 18.4L6.24 15.59V14.81Z" fill="#FBBC05"/>
        <path d="M12 5.25C13.43 5.25 14.63 5.74 15.51 6.58L19.59 2.5C17.45 0.94 14.97 0 12 0C7.74 0 4.01 1.91 2.03 5.38L6.24 8.19C7.14 5.94 9.37 5.25 12 5.25Z" fill="#EA4335"/>
    </svg>
)

export default function AuthForm({ mode }: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();
  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { confirmPassword: "" }),
    },
  });

  const handleAuthSuccess = (email: string) => {
    login({ email, name: "Guest User" });
    router.push("/");
    toast({
      title: isLogin ? "Login Successful" : "Signup Successful",
      description: isLogin ? "Welcome back!" : "Your account has been created.",
    });
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      handleAuthSuccess(values.email);
    }, 1000);
  };
  
  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    // Simulate Google Sign-In
    setTimeout(() => {
        setIsSubmitting(false);
        handleAuthSuccess("guest.user@google.com");
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isLogin && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : (isLogin ? "Log In" : "Sign Up")}
        </Button>
        <div className="relative">
            <Separator className="absolute top-1/2 -translate-y-1/2" />
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>
        <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Google</>}
        </Button>
      </form>
    </Form>
  );
}
