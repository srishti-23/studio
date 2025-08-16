
"use client";

import { useState, useEffect } from "react";
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
import { signupUser, loginUser, sendVerificationOtp, findOrCreateUserFromGoogle } from "@/lib/actions/auth";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import OtpInput from "./otp-input";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AuthFormProps = {
  mode: "login" | "signup";
};

type SignupFormValues = z.infer<typeof signupSchema>;

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
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const isLogin = mode === "login";

  // State for signup flow
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [signupData, setSignupData] = useState<SignupFormValues | null>(null);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const schema = isLogin ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { name: "" }),
    },
  });
  
  useEffect(() => {
    // If user becomes available (and auth is not loading), redirect.
    // This handles the case where a logged-in user visits /login.
    if (user && !isAuthLoading) {
      router.push('/');
    }
  }, [user, isAuthLoading, router]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  const handleLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await loginUser(values);
      if (result.success && result.user) {
        login(result.user); // Sets user for cookie-based session
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: result.message });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSignupDetailsSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setSignupData(values);
    const result = await sendVerificationOtp(values.email);
    if (result.success) {
      if (result.otp) { // For development: show OTP in toast
        toast({ title: "Verification Code Sent", description: `For testing, your OTP is: ${result.otp}` });
      } else {
        toast({ title: "Verification Code Sent", description: "An OTP has been sent to your email." });
      }
      setSignupStep('otp');
      setResendCooldown(30);
    } else {
      toast({ variant: "destructive", title: "Signup Failed", description: result.message });
    }
    setIsSubmitting(false);
  };
  
  const handleResendOtp = async () => {
    if (signupData && resendCooldown === 0) {
      setIsSubmitting(true);
      const result = await sendVerificationOtp(signupData.email);
      if (result.success) {
        if (result.otp) {
          toast({ title: "Verification Code Sent", description: `For testing, your OTP is: ${result.otp}` });
        } else {
          toast({ title: "Verification Code Sent", description: "A new OTP has been sent." });
        }
        setResendCooldown(30);
      } else {
        toast({ variant: "destructive", title: "Failed to resend", description: result.message });
      }
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!signupData || otp.length !== 6) return;
    setIsSubmitting(true);
    const result = await signupUser(signupData, otp);
    if (result.success && result.user) {
        login(result.user);
        toast({ title: "Signup Successful", description: "Welcome to AdFleek!" });
        router.push("/");
    } else {
        toast({ variant: "destructive", title: "Verification Failed", description: result.message });
    }
    setIsSubmitting(false);
  };
  
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (firebaseUser.email && firebaseUser.displayName && firebaseUser.uid) {
        const serverResult = await findOrCreateUserFromGoogle({
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            uid: firebaseUser.uid,
        });

        if (serverResult.success && serverResult.user) {
            login(serverResult.user); // Update client state
            toast({ title: "Google Sign-In Successful", description: "Welcome!" });
            router.push("/");
        } else {
            throw new Error(serverResult.message || "Failed to sync account with server.");
        }
      } else {
          throw new Error("Could not retrieve user details from Google.");
      }
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            toast({ variant: "destructive", title: "Sign-In Failed", description: error.message || "An unexpected error occurred during Google Sign-In." });
        }
        setIsSubmitting(false);
    }
  };

  if (isLogin) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-6">
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
          <div className="text-right text-sm">
            <Link href="/forgot-password" passHref className="text-muted-foreground hover:text-primary hover:underline">
                Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || isAuthLoading}>
            {isSubmitting || isAuthLoading ? <LoaderCircle className="animate-spin" /> : "Log In"}
          </Button>
          <div className="relative">
              <Separator className="absolute top-1/2 -translate-y-1/2" />
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
          </div>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting || isAuthLoading}>
            {isSubmitting || isAuthLoading ? <LoaderCircle className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Google</>}
          </Button>
        </form>
      </Form>
    );
  }

  // Signup form
  return (
    <Form {...form}>
      {signupStep === 'details' ? (
          <form onSubmit={form.handleSubmit(handleSignupDetailsSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Verify Email"}
            </Button>
          </form>
      ) : (
        <div className="space-y-6 text-center">
          <div>
            <FormLabel>Enter OTP</FormLabel>
            <p className="text-sm text-muted-foreground">An OTP was sent to {signupData?.email}</p>
          </div>
          <OtpInput value={otp} onChange={setOtp} />
          <Button className="w-full" onClick={handleOtpSubmit} disabled={isSubmitting || otp.length < 6}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Create Account"}
          </Button>
          <div className="text-sm text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isSubmitting}
              className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
          <Button variant="link" onClick={() => setSignupStep('details')}>Back</Button>
        </div>
      )}

      <div className="relative mt-6">
          <Separator className="absolute top-1/2 -translate-y-1/2" />
          <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
      </div>
      <Button variant="outline" className="w-full mt-6" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting || isAuthLoading || signupStep === 'otp'}>
          {isSubmitting || isAuthLoading ? <LoaderCircle className="animate-spin" /> : <><GoogleIcon className="mr-2" /> Sign Up with Google</>}
      </Button>
    </Form>
  );
}
