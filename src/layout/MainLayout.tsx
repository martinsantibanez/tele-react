import React, { PropsWithChildren } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { NavBar } from "./NavBar";

type Props = {};
export function MainLayout({ children }: PropsWithChildren<Props>) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
