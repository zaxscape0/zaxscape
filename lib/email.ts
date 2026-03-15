import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY as string)

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #000;
  color: #fff;
  padding: 0;
  margin: 0;
`

function emailWrapper(content: string) {
  return `
    <div style="${baseStyle}">
      <div style="max-width: 600px; margin: 0 auto; padding: 48px 32px;">
        <div style="margin-bottom: 40px; border-bottom: 1px solid #222; padding-bottom: 24px;">
          <span style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #666;">// zaxscape</span>
          <div style="font-size: 20px; font-weight: 700; color: #fff; margin-top: 8px; letter-spacing: -0.02em;">ZAXSCAPE</div>
        </div>
        ${content}
        <div style="margin-top: 48px; border-top: 1px solid #222; padding-top: 24px;">
          <p style="font-family: 'Courier New', monospace; font-size: 11px; color: #444; margin: 0;">© 2026 ZaxScape · <a href="https://app.zaxscape.com" style="color: #666; text-decoration: none;">app.zaxscape.com</a></p>
        </div>
      </div>
    </div>
  `
}

export async function sendChangeAlert(to: string, name: string, summary: string, url: string) {
  const content = `
    <div style="margin-bottom: 32px;">
      <div style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #666; margin-bottom: 16px;">// competitor alert</div>
      <h1 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; letter-spacing: -0.02em;">${name} just changed.</h1>
      <p style="color: #888; font-size: 15px; margin: 0;">We detected a change on their site.</p>
    </div>
    <div style="background: #0a0a0a; border: 1px solid #222; padding: 24px; margin-bottom: 32px;">
      <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #444; margin-bottom: 12px;">// what changed</div>
      <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0;">${summary}</p>
    </div>
    <a href="${url}" style="display: inline-block; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 700;">View their site →</a>
  `
  await resend.emails.send({
    from: 'ZaxScape <info@zaxscape.com>',
    to,
    subject: `⚡ ${name} just made a move`,
    html: emailWrapper(content),
  })
}

export async function sendWelcomeEmail(to: string) {
  const content = `
    <div style="margin-bottom: 32px;">
      <div style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #666; margin-bottom: 16px;">// welcome</div>
      <h1 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; letter-spacing: -0.02em;">You're in.</h1>
      <p style="color: #888; font-size: 15px; margin: 0 0 24px;">ZaxScape is now watching your competitors 24/7. Here's how to get started.</p>
    </div>
    <div style="background: #0a0a0a; border: 1px solid #222; padding: 24px; margin-bottom: 32px;">
      <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #444; margin-bottom: 16px;">// next steps</div>
      <div style="color: #888; font-size: 14px; line-height: 2;">
        <div>— Add your first competitor URL</div>
        <div>— We'll take an initial snapshot</div>
        <div>— Get alerted the moment anything changes</div>
      </div>
    </div>
    <a href="https://app.zaxscape.com/competitors" style="display: inline-block; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 700;">Add your first competitor →</a>
  `
  await resend.emails.send({
    from: 'ZaxScape <info@zaxscape.com>',
    to,
    subject: 'Welcome to ZaxScape — let\'s get started',
    html: emailWrapper(content),
  })
}

export async function sendWeeklyDigest(to: string, changes: { competitorName: string; summary: string; url: string }[]) {
  const items = changes.map(c => `
    <div style="border-bottom: 1px solid #1a1a1a; padding: 20px 0;">
      <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; margin-bottom: 8px;">${c.competitorName}</div>
      <p style="color: #ccc; font-size: 14px; line-height: 1.6; margin: 0 0 12px;">${c.summary}</p>
      <a href="${c.url}" style="font-family: 'Courier New', monospace; font-size: 11px; color: #888; text-decoration: none;">View site →</a>
    </div>
  `).join('')

  const content = `
    <div style="margin-bottom: 32px;">
      <div style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #666; margin-bottom: 16px;">// weekly digest</div>
      <h1 style="font-size: 28px; font-weight: 700; color: #fff; margin: 0 0 8px; letter-spacing: -0.02em;">Your weekly intel.</h1>
      <p style="color: #888; font-size: 15px; margin: 0;">${changes.length} competitor ${changes.length === 1 ? 'change' : 'changes'} this week.</p>
    </div>
    <div style="background: #0a0a0a; border: 1px solid #222; padding: 24px; margin-bottom: 32px;">
      ${changes.length > 0 ? items : '<p style="color: #666; font-size: 14px; margin: 0;">No changes detected this week. Your competitors are quiet.</p>'}
    </div>
    <a href="https://app.zaxscape.com/dashboard" style="display: inline-block; font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; background: #fff; color: #000; padding: 12px 24px; text-decoration: none; font-weight: 700;">View dashboard →</a>
  `
  await resend.emails.send({
    from: 'ZaxScape <info@zaxscape.com>',
    to,
    subject: `Your ZaxScape weekly digest — ${changes.length} ${changes.length === 1 ? 'change' : 'changes'}`,
    html: emailWrapper(content),
  })
}
