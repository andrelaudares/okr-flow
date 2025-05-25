
import React from "npm:react@18.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";

export default function WelcomeEmail(data: any) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao NobugOKR - Gerencie seus objetivos</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://nobugokr.com/logo.png"
            width="170"
            height="50"
            alt="NobugOKR"
            style={logo}
          />
          <Heading style={h1}>Bem-vindo ao NobugOKR</Heading>
          <Text style={paragraph}>
            Olá {data.name}, 
            Estamos empolgados em tê-lo conosco! O NobugOKR vai ajudar você e sua equipe a alcançar resultados incríveis.
          </Text>
          <Section style={btnContainer}>
            <Link href="https://nobugokr.com/dashboard" style={button}>
              Acessar Dashboard
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const logo = {
  margin: "0 auto 20px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#1d1c1d",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const button = {
  backgroundColor: "#2754C5",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};
