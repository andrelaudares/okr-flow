
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

export default function MagicLinkEmail(data: any) {
  // Add validation to ensure the magic link exists
  const magicLink = data?.magicLink || '#';
  
  return (
    <Html>
      <Head />
      <Preview>Seu link de login para NobugOKR</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Login no NobugOKR</Heading>
          <Text style={paragraph}>
            Clique no link abaixo para fazer login na sua conta:
          </Text>
          <Section style={btnContainer}>
            <Link href={magicLink} style={button}>
              Fazer Login
            </Link>
          </Section>
          <Text style={footer}>
            Este link expirará em 1 hora. Se você não solicitou este login, 
            pode ignorar este e-mail.
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
