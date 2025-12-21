import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const PublicVisitorSuccess = () => {
  const { visitorId } = useParams();
  const location = useLocation();

  const handleDownload = () => {
    // Note: To properly download SVG as Image, we need a converter or just force print.
    // For MVP, window.print() is safer/easier than canvas hack with SVG component.
    window.print();
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl text-center border-t-8 border-green-500">
          <CardContent className="p-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Registration Successful!
              </h1>
              <p className="text-gray-600 mt-2">Thank you for registering.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 inline-block">
              <div className="mb-2 text-sm font-semibold text-gray-500">
                YOUR VISITOR ID
              </div>
              <div className="text-3xl font-mono font-bold text-blue-600 mb-4">
                {visitorId}
              </div>

              <div className="flex justify-center">
                <QRCodeSVG
                  value={visitorId}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Scan this code at the entry
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Required tokens/cards have been sent to your Mobile Number and
                Email.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Download /
                  Print
                </Button>

                {location.state?.inviteCode ? (
                  <Link to={`/invite/${location.state.inviteCode}`}>
                    <Button variant="ghost" className="w-full text-blue-600">
                      Register Another Person (Invite)
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <Button variant="ghost" className="w-full text-blue-600">
                      Register Another Person
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicVisitorSuccess;
