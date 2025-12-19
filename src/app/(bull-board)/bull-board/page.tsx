/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, RefreshCw, ExternalLink } from "lucide-react";

const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_BULL_BOARD_PASSWORD || "admin123";
const BULL_BOARD_URL =
  process.env.NEXT_PUBLIC_BULL_BOARD_URL || "http://localhost:3001";

export default function BullBoardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("bull-board-auth", "true");
    } else {
      setError("Invalid password. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("bull-board-auth");
    setPassword("");
  };

  const handleRefresh = () => {
    const iframe = document.getElementById(
      "bull-board-iframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  // Check if already authenticated after mount (required for hydration)
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("bull-board-auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsMounted(true);
  }, []);

  // Show nothing during SSR to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-2xl border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">🚀 Bull Board</CardTitle>
            <CardDescription className="text-gray-400">
              Enter admin password to access the queue dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-800">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📊</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">Bull Board Dashboard</h1>
            <p className="text-gray-400 text-xs">
              Queue monitoring & management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(BULL_BOARD_URL, "_blank")}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Tab
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Lock className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          id="bull-board-iframe"
          src={BULL_BOARD_URL}
          className="absolute inset-0 w-full h-full border-0"
          title="Bull Board Dashboard"
        />
      </div>
    </div>
  );
}
