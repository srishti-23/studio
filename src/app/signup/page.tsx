import Link from 'next/link';
import AuthForm from '@/components/auth/auth-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <Link href="/" className="flex items-center justify-center mb-8 gap-2 font-headline text-2xl font-bold">
                <Rocket className="h-8 w-8 text-primary" />
                <span className="text-primary">AdFleek.io</span>
            </Link>
            <Card className="shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Join AdFleek and start creating stunning ads in seconds.</CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm mode="signup" />
            </CardContent>
            <CardFooter>
                <div className="text-center text-sm text-muted-foreground w-full">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Log in
                    </Link>
                </div>
            </CardFooter>
            </Card>
        </div>
    </div>
  );
}
