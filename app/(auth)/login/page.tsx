"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Auth } from "@/lib/auth";
import React from "react";

const Login = () => {
  return (
    <div>
      <Card>
        <CardContent>
        <Button
          variant={"secondary"}
          onClick={() => {
            Auth.attempt({ email: "", password: "" });
          }}
        >
          login
        </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
