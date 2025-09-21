import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCodeError() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Google OAuth Setup Required</CardTitle>
            <CardDescription>Google OAuth provider needs to be configured in Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                Google OAuth is not configured in your Supabase project. Follow the steps below to set it up.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Step 1: Google Cloud Console Setup</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-600">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the Google+ API</li>
                  <li>Go to "Credentials" → "Create Credentials" → "OAuth Client ID"</li>
                  <li>Select "Web application" as the application type</li>
                  <li>Add your site URL to "Authorized JavaScript origins"</li>
                  <li>
                    Add this callback URL to "Authorized redirect URLs":
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1">
                      https://[your-supabase-project].supabase.co/auth/v1/callback
                    </code>
                  </li>
                  <li>Copy the Client ID and Client Secret</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Step 2: Supabase Dashboard Setup</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-600">
                  <li>
                    Go to your{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Supabase Dashboard
                    </a>
                  </li>
                  <li>Navigate to Authentication → Providers</li>
                  <li>Find "Google" and toggle it ON</li>
                  <li>Paste your Google Client ID and Client Secret</li>
                  <li>Click "Save"</li>
                </ol>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-xs">
                  <strong>Note:</strong> Make sure to add both your development URL (localhost:3000) and production URL
                  to the Authorized JavaScript origins in Google Cloud Console.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth/login">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a
                  href="https://supabase.com/docs/guides/auth/social-login/auth-google"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
