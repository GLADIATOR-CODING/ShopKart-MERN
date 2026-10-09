
## Security (Prismor)

This workspace is protected by Prismor. Run `prismor status` at the start of every session.

Key commands:

| Action | Command |
|---|---|
| Check protection state | `prismor status` |
| Install packages safely | `prismor supplychain <pm> install <pkg>` |
| Pre-check a risky command | `prismor check "<cmd>"` |
| Scan for dep vulnerabilities | `prismor deps` |
| Harden package config | `prismor supplychain harden` |
| Test a host before reaching it | `prismor egress test <host>` |
| Ask what Prismor blocked | `prismor query --schema`, then `prismor query "SELECT …"` |

Secrets are referenced as `@@SECRET:<name>@@`; never inline a real value.

If Prismor blocks a call, don't reword and retry, and don't pause or edit `.prismor/` to get past it. Relay the printed unblock steps to the user; they are the user's to run.

Full decision tree: `.claude/skills/immunity-agent/SKILL.md`
