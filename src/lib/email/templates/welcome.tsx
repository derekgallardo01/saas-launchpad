/**
 * Welcome email template for new user sign-ups.
 *
 * Renders a clean, responsive HTML email using React.
 * Intended for use with Resend, SendGrid, or any transactional email provider.
 *
 * @example
 * ```ts
 * import { renderToStaticMarkup } from "react-dom/server";
 * import { WelcomeEmail } from "@/lib/email/templates/welcome";
 *
 * const html = renderToStaticMarkup(
 *   <WelcomeEmail
 *     userName="Jane"
 *     dashboardUrl="https://app.example.com/dashboard"
 *     docsUrl="https://docs.example.com"
 *   />
 * );
 *
 * // TODO: Send via Resend / SendGrid
 * // await resend.emails.send({ to, subject: "Welcome to SaaS Launchpad!", html });
 * ```
 */

import React from "react";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
  docsUrl?: string;
  supportEmail?: string;
}

export function WelcomeEmail({
  userName,
  dashboardUrl,
  docsUrl = "https://docs.example.com",
  supportEmail = "support@example.com",
}: WelcomeEmailProps) {
  const quickStartLinks = [
    { label: "Create your first organization", href: `${dashboardUrl}?action=create-org` },
    { label: "Invite team members", href: `${dashboardUrl}/members` },
    { label: "Generate API keys", href: `${dashboardUrl}/api-keys` },
    { label: "Read the documentation", href: docsUrl },
  ];

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to SaaS Launchpad</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f4f4f5",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={{ backgroundColor: "#f4f4f5" }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "40px 16px" }}>
                <table
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  role="presentation"
                  style={{
                    maxWidth: 480,
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <tbody>
                    {/* Header with gradient */}
                    <tr>
                      <td
                        style={{
                          padding: "32px 32px 24px",
                          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: "rgba(255,255,255,0.2)",
                            display: "inline-block",
                            textAlign: "center",
                            lineHeight: "48px",
                            marginBottom: 16,
                          }}
                        >
                          <span style={{ fontSize: 24 }}>&#9889;</span>
                        </div>
                        <h1
                          style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#ffffff",
                            lineHeight: 1.3,
                          }}
                        >
                          Welcome to SaaS Launchpad!
                        </h1>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "32px" }}>
                        <p
                          style={{
                            margin: "0 0 16px",
                            fontSize: 15,
                            color: "#18181b",
                            lineHeight: 1.6,
                          }}
                        >
                          Hi {userName},
                        </p>
                        <p
                          style={{
                            margin: "0 0 24px",
                            fontSize: 14,
                            color: "#52525b",
                            lineHeight: 1.6,
                          }}
                        >
                          Thanks for signing up! Your account is ready to go. Here are a few
                          things you can do to get started:
                        </p>

                        {/* Quick Start Links */}
                        <table
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          role="presentation"
                          style={{ marginBottom: 24 }}
                        >
                          <tbody>
                            {quickStartLinks.map((link, i) => (
                              <tr key={i}>
                                <td
                                  style={{
                                    padding: "10px 12px",
                                    borderBottom: i < quickStartLinks.length - 1 ? "1px solid #f4f4f5" : "none",
                                  }}
                                >
                                  <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                                    <tbody>
                                      <tr>
                                        <td style={{ width: 24, verticalAlign: "middle" }}>
                                          <div
                                            style={{
                                              width: 20,
                                              height: 20,
                                              borderRadius: "50%",
                                              backgroundColor: "#eef2ff",
                                              textAlign: "center",
                                              lineHeight: "20px",
                                              fontSize: 11,
                                              color: "#4f46e5",
                                              fontWeight: 700,
                                            }}
                                          >
                                            {i + 1}
                                          </div>
                                        </td>
                                        <td style={{ paddingLeft: 8, verticalAlign: "middle" }}>
                                          <a
                                            href={link.href}
                                            style={{
                                              fontSize: 13,
                                              color: "#4f46e5",
                                              textDecoration: "none",
                                              fontWeight: 500,
                                            }}
                                          >
                                            {link.label}
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* CTA Button */}
                        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                          <tbody>
                            <tr>
                              <td align="center">
                                <a
                                  href={dashboardUrl}
                                  style={{
                                    display: "inline-block",
                                    padding: "12px 32px",
                                    backgroundColor: "#4f46e5",
                                    color: "#ffffff",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    borderRadius: 8,
                                    lineHeight: 1,
                                  }}
                                >
                                  Go to Dashboard
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          padding: "20px 32px",
                          borderTop: "1px solid #f4f4f5",
                          backgroundColor: "#fafafa",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 4px",
                            fontSize: 11,
                            color: "#a1a1aa",
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          Need help? Contact us at{" "}
                          <a href={`mailto:${supportEmail}`} style={{ color: "#6366f1" }}>
                            {supportEmail}
                          </a>
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "#a1a1aa",
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          SaaS Launchpad
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
