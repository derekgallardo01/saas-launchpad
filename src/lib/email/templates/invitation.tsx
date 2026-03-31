/**
 * Email template for organization member invitations.
 *
 * Renders a professional, responsive HTML email using React.
 * Intended for use with Resend, SendGrid, or any provider that accepts HTML.
 *
 * @example
 * ```ts
 * import { renderToStaticMarkup } from "react-dom/server";
 * import { InvitationEmail } from "@/lib/email/templates/invitation";
 *
 * const html = renderToStaticMarkup(
 *   <InvitationEmail
 *     orgName="Acme Inc"
 *     inviterName="Jane Doe"
 *     inviterEmail="jane@acme.com"
 *     role="Admin"
 *     inviteUrl="https://app.example.com/invite/abc123"
 *   />
 * );
 *
 * // TODO: Send via Resend / SendGrid
 * // await resend.emails.send({ to, subject, html });
 * ```
 */

import React from "react";

interface InvitationEmailProps {
  orgName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  inviteUrl: string;
}

export function InvitationEmail({
  orgName,
  inviterName,
  inviterEmail,
  role,
  inviteUrl,
}: InvitationEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Join ${orgName}`}</title>
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
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          padding: "32px 32px 24px",
                          borderBottom: "1px solid #e4e4e7",
                        }}
                      >
                        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                          <tbody>
                            <tr>
                              <td>
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                    display: "inline-block",
                                    textAlign: "center",
                                    lineHeight: "40px",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 16,
                                  }}
                                >
                                  {orgName.charAt(0).toUpperCase()}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "32px" }}>
                        <h1
                          style={{
                            margin: "0 0 8px",
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#18181b",
                            lineHeight: 1.3,
                          }}
                        >
                          You&apos;ve been invited to join {orgName}
                        </h1>
                        <p
                          style={{
                            margin: "0 0 24px",
                            fontSize: 14,
                            color: "#71717a",
                            lineHeight: 1.6,
                          }}
                        >
                          <strong style={{ color: "#3f3f46" }}>{inviterName}</strong> (
                          {inviterEmail}) has invited you to join{" "}
                          <strong style={{ color: "#3f3f46" }}>{orgName}</strong> as a{" "}
                          <strong style={{ color: "#3f3f46" }}>{role}</strong>.
                        </p>

                        {/* CTA Button */}
                        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                          <tbody>
                            <tr>
                              <td align="center">
                                <a
                                  href={inviteUrl}
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
                                  Accept Invitation
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p
                          style={{
                            margin: "24px 0 0",
                            fontSize: 12,
                            color: "#a1a1aa",
                            lineHeight: 1.6,
                          }}
                        >
                          This invitation expires in 7 days. If you didn&apos;t expect this
                          email, you can safely ignore it.
                        </p>

                        {/* Fallback link */}
                        <p
                          style={{
                            margin: "16px 0 0",
                            fontSize: 11,
                            color: "#a1a1aa",
                            lineHeight: 1.6,
                            wordBreak: "break-all",
                          }}
                        >
                          If the button doesn&apos;t work, copy and paste this URL into your
                          browser:{" "}
                          <a href={inviteUrl} style={{ color: "#6366f1" }}>
                            {inviteUrl}
                          </a>
                        </p>
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
                            margin: 0,
                            fontSize: 11,
                            color: "#a1a1aa",
                            textAlign: "center",
                            lineHeight: 1.5,
                          }}
                        >
                          Sent by SaaS Launchpad on behalf of {orgName}
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
