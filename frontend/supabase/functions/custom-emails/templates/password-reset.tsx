
import React from "npm:react@18.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";

export default function PasswordResetEmail(data: any) {
  return (
    <Html>
      <Head />
      <Preview>Redefinição de Senha - NobugOKR</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Redefinição de Senha</Heading>
          <Text style={paragraph}>
            Recebemos uma solicitação para redefinir a senha da sua conta NobugOKR.
            Clique no botão abaixo para definir uma nova senha:
          </Text>
          <Section style={btnContainer}>
            <Link href={data.resetLink} style={button}>
              Redefinir Senha
            </Link>
          </Section>
          <Text style={footer}>
            Este link de redefinição expirará em 1 hora. 
            Se você não solicitou esta redefinição, ignore este e-mail.
          </Text>
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

const footer = {
  color: "#898989",
  fontSize: "12px",
  marginTop: "24px",
  textAlign: "center" as const,
};
