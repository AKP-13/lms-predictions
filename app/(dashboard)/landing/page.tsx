import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LandingPage = async () => {
  const emailSubject = 'PickIQ Waitlist';
  const emailBody = "Hi, I'd like to join the PickIQ waitlist!";
  const mailtoLink = `mailto:alexlmsapp@icloud.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">PickIQ</h1>
        <p className="text-muted-foreground">Your Premier League LMS hub.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <CardContent>
              <div className="p-6">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="6" fill="currentColor" />
                </svg>
              </div>
            </CardContent>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardContent>
              <div className="p-6">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24">
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </CardContent>
            <CardTitle>Submit</CardTitle>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardContent>
              <div className="p-6">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24">
                  <polygon points="12,6 18,18 6,18" fill="currentColor" />
                </svg>
              </div>
            </CardContent>
            <CardTitle>Analyse</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Get ahead of the game.</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The only tool you need to play a Premier League LMS game. Join the
          waitlist to be the first to know when it's launched.
        </p>
        <Button size="lg">
          <a href={mailtoLink}>Join the waitlist</a>
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
