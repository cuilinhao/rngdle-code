# Deployment record — 2026-09-26

- Repository: https://github.com/cuilinhao/rngdle-code ; branch `main`.
- Application/dependency release: `1c6213af455d1e438e0fd668e8f563e33dd0aea1`.
- Vercel project: `linhaos-projects/rngdle-art`, connected to the GitHub repository. Main pushes automatically deploy to production.
- Verified application deployment: `dpl_AGfK4fPW43Gbf7wqZXqrcijSs6ZD` (Ready), https://rngdle-np6uds59f-linhaos-projects.vercel.app .
- Primary URL: https://rngdle.art ; Chinese entry: https://rngdle.art/zh .
- Additional domain: https://www.rngdle.art ; both hosts serve the same app, with canonical URLs pointing to rngdle.art.
- Backup URL: https://rngdle-art.vercel.app .
- GitHub build/test run for the application release: https://github.com/cuilinhao/rngdle-code/actions/runs/36226450999 — success.
- Later commits containing acceptance evidence and deployment documentation do not change application behavior. See GitHub main for the latest report commit.

## DNS and HTTPS

Namecheap Advanced DNS was edited through the already logged-in desktop browser and saved successfully. Nameservers remain `dns1.registrar-servers.com` and `dns2.registrar-servers.com`.

| Type | Host | Value | TTL |
|---|---|---|---|
| A | @ | 216.150.1.1 | 30 min |
| A | @ | 216.150.16.1 | Automatic |
| CNAME | www | ca491a073f28d8ac.vercel-dns-016.com. | 30 min |

The previous @ URL Redirect to http://www.rngdle.art/ was changed into the first A record; the previous www parking CNAME was updated. Existing email forwarding/TXT settings were retained. No other domains or nameservers were changed.

Both configured A records and the www CNAME were confirmed from the authoritative DNS. Vercel reports both domain configurations valid. Vercel automatically issued certificates for rngdle.art and www.rngdle.art; both HTTPS endpoints returned 200 with certificate verification enabled. Initial connection closures while certificates were being issued resolved without bypassing TLS verification.

## Production acceptance

The primary domain and backup Vercel alias each passed all 30 browser acceptance cases in real Chrome and 291 HTTP checks. Full details, bounded network retries and remaining scope limits are in VERIFICATION.md. No application secret, API key or environment variable is needed; Vercel authentication remains outside Git.
