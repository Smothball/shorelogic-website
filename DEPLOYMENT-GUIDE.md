# Shore Logic — Deployment Guide

Follow these steps in order. Each section tells you exactly what to do and what you'll see.

---

## Step 1 — Set Up Google Apps Script (the form backend)

This handles form submissions: it logs them to your Google Sheet and emails you.

1. Go to **script.google.com** (sign in with your Google Workspace account)
2. Click **New project**
3. Delete all the default code in the editor
4. Open the file `apps-script.gs` from this repo and copy all of its contents
5. Paste it into the Apps Script editor
6. Click the floppy disk icon (Save) — name the project "Shore Logic Form Handler"
7. Click **Deploy** (top right) → **New deployment**
8. Click the gear icon next to "Type" and select **Web app**
9. Set these options:
   - **Description:** Shore Logic form handler v1
   - **Execute as:** Me
   - **Who has access:** Anyone
10. Click **Deploy**
11. A popup will ask you to authorize — click **Authorize access**, choose your Google account, and click **Allow**
12. Copy the **Web app URL** shown — it looks like: `https://script.google.com/macros/s/LONG_ID/exec`

---

## Step 2 — Add the Apps Script URL to the Website

1. Open `index.html` in a text editor
2. Find this line near the bottom:
   ```
   const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 1
4. Save the file

---

## Step 3 — Enable GitHub Pages (free hosting)

1. Go to **github.com/Smothball/shorelogicai**
2. Click **Settings** (top tab in the repo)
3. In the left sidebar, click **Pages**
4. Under "Source", select **Deploy from a branch**
5. Set Branch = **main**, folder = **/ (root)**
6. Click **Save**
7. Wait 1–2 minutes — GitHub will show you a URL like `https://smothball.github.io/shorelogicai`
8. Visit that URL to confirm the site is live

---

## Step 4 — Point Your Domain (shorelogic.ai → GitHub Pages)

Your domain is registered in Squarespace. You'll update the DNS records there.

1. Log in to **Squarespace** → Domains → shorelogic.ai → DNS Settings
2. Delete any existing A records for the root domain (@)
3. Add these **4 A records** (all pointing to GitHub's IPs):

   | Type | Host | Value          |
   |------|------|----------------|
   | A    | @    | 185.199.108.153 |
   | A    | @    | 185.199.109.153 |
   | A    | @    | 185.199.110.153 |
   | A    | @    | 185.199.111.153 |

4. Add a **CNAME record**:

   | Type  | Host | Value                        |
   |-------|------|------------------------------|
   | CNAME | www  | smothball.github.io          |

5. Back in GitHub → Settings → Pages → Custom domain: type `shorelogic.ai` and click **Save**
6. Check the box **Enforce HTTPS** (may take a few minutes to appear)
7. DNS propagation takes 10 minutes to 48 hours — once complete, shorelogic.ai will load your site

---

## Step 5 — Test Everything

1. Visit shorelogic.ai (or the GitHub Pages URL before DNS is set)
2. Fill out the contact form and submit
3. Confirm:
   - You see the green "Thank you" confirmation message
   - You receive an email at smothes@shorelogic.ai
   - A new row appears in your Google Sheet

---

## Ongoing Updates

To update the website after launch:

1. Edit `index.html` on your computer
2. Open a terminal in the repo folder and run:
   ```
   git add index.html
   git commit -m "describe what you changed"
   git push
   ```
3. GitHub Pages automatically redeploys within ~1 minute

Or ask Claude Code to make changes — it can commit and push for you.

---

## Support

Questions? Email smothes@shorelogic.ai or open the project in Claude Code.
